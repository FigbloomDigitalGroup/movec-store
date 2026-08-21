import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { EmailService } from '../email/email.service';
import axios from 'axios';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { getPrimaryFrontendUrl } from '../common/frontend-url';

interface OAuthTokenResponse {
  access_token: string;
}

interface MpesaStkResponse {
  CheckoutRequestID: string;
}

interface PaystackInitializeResponse {
  data: { authorization_url: string; access_code: string; reference: string };
}

interface PaystackVerifyResponse {
  data: unknown;
}

interface PaypalOrderResponse {
  id: string;
  links: { rel: string; href: string }[];
}

interface PaypalCaptureResponse {
  status: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private inventoryService: InventoryService,
    private emailService: EmailService,
  ) {}

  // Fired from every path that transitions an order to CONFIRMED (M-Pesa/Paystack
  // webhooks, PayPal capture, admin bank-transfer confirmation). Failure to send is
  // logged, not thrown — a flaky mail provider should never roll back or fail a
  // payment that has already been captured.
  async sendOrderConfirmationEmail(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: true,
        payments: true,
        shippingAddress: true,
      },
    });
    if (!order) return;

    const payment =
      order.payments.find((p) => p.status === 'COMPLETED') ?? order.payments[0];

    try {
      await this.emailService.sendOrderConfirmation({
        toEmail: order.user.email,
        toName: `${order.user.firstName} ${order.user.lastName}`.trim(),
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        items: order.items.map((item) => ({
          name: item.productNameSnapshot,
          sku: item.productSkuSnapshot,
          quantity: item.quantity,
          price: Number(item.priceSnapshot),
        })),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        taxAmount: Number(order.taxAmount),
        discountAmount: Number(order.discountAmount),
        total: Number(order.total),
        currency: payment?.currency,
        paymentMethod: payment?.method,
        shippingAddress: order.shippingAddress
          ? {
              line1: order.shippingAddress.line1,
              line2: order.shippingAddress.line2,
              city: order.shippingAddress.city,
              state: order.shippingAddress.state,
              postalCode: order.shippingAddress.postalCode,
              country: order.shippingAddress.country,
            }
          : undefined,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send order receipt for ${order.orderNumber}:`,
        error,
      );
    }
  }

  // Scoping every lookup to the requesting user prevents one authenticated
  // customer from initiating or capturing payment against another customer's
  // order just by knowing or guessing its order number. A mismatched owner is
  // reported as "not found", not "forbidden", so a caller can't use this to
  // probe which order numbers exist.
  private async findOrder(orderNumber: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { payments: true },
    });
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  // ─── M-Pesa ─────────────────────────────────────────────────────────────────

  async initiateMpesa(
    orderNumber: string,
    phoneNumber: string,
    userId: string,
  ) {
    const order = await this.findOrder(orderNumber, userId);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending payment');
    }

    const consumerKey = this.configService.get<string>('MPESA_CONSUMER_KEY');
    const consumerSecret = this.configService.get<string>(
      'MPESA_CONSUMER_SECRET',
    );
    const passkey = this.configService.get<string>('MPESA_PASSKEY');
    const shortcode = this.configService.get<string>('MPESA_SHORTCODE');
    const callbackUrl = this.configService.get<string>('MPESA_CALLBACK_URL');
    const callbackSecret = this.configService.get<string>(
      'MPESA_CALLBACK_SECRET',
    );

    if (!consumerKey || !consumerSecret) {
      throw new BadRequestException('M-Pesa is not configured');
    }

    // Unlike Paystack, Safaricom's STK callback carries no signature — the callback
    // URL is supplied fresh on every request, so we stamp our own shared secret onto
    // it here and the webhook checks it, rather than trusting the caller on identity
    // alone. If MPESA_CALLBACK_SECRET isn't set yet, this is a no-op (see the webhook
    // handler's matching fallback) so existing deployments keep working uninterrupted.
    const finalCallbackUrl =
      callbackUrl && callbackSecret
        ? `${callbackUrl}${callbackUrl.includes('?') ? '&' : '?'}secret=${encodeURIComponent(callbackSecret)}`
        : callbackUrl;

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
      'base64',
    );

    try {
      const { data: authData } = await axios.get<OAuthTokenResponse>(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        { headers: { Authorization: `Basic ${auth}` } },
      );

      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T.]/g, '')
        .slice(0, 14);
      const password = Buffer.from(
        `${shortcode}${passkey}${timestamp}`,
      ).toString('base64');

      const stkPayload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(Number(order.total)),
        PartyA: phoneNumber.replace(/^\+254/, '254').replace(/^0/, '254'),
        PartyB: shortcode,
        PhoneNumber: phoneNumber.replace(/^\+254/, '254').replace(/^0/, '254'),
        CallBackURL: finalCallbackUrl || 'https://example.com/callback',
        AccountReference: orderNumber,
        TransactionDesc: `Payment for ${orderNumber}`,
      };

      const { data: stkData } = await axios.post<MpesaStkResponse>(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        stkPayload,
        { headers: { Authorization: `Bearer ${authData.access_token}` } },
      );

      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'MPESA',
          status: 'PENDING',
          amount: order.total,
          currency: 'KES',
          transactionReference: stkData.CheckoutRequestID,
          transactions: {
            create: {
              provider: 'MPESA',
              requestPayload: stkPayload,
              responsePayload: stkData as unknown as Prisma.InputJsonValue,
              status: 'PENDING',
            },
          },
        },
      });

      return {
        message: 'STK Push sent to your phone. Please enter your PIN.',
        checkoutRequestId: stkData.CheckoutRequestID,
      };
    } catch (error) {
      this.logger.error(
        'M-Pesa error:',
        axios.isAxiosError(error)
          ? error.response?.data
          : (error as Error).message,
      );
      throw new BadRequestException('Failed to initiate M-Pesa payment');
    }
  }

  // ─── Paystack ────────────────────────────────────────────────────────────────

  async initiatePaystack(
    orderNumber: string,
    email: string,
    userId: string,
    codDeposit = false,
  ) {
    const order = await this.findOrder(orderNumber, userId);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending payment');
    }

    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new BadRequestException('Paystack is not configured');
    }

    let amount = order.total.toNumber();
    if (codDeposit) {
      const settings = await this.getPaymentSettings();
      const { requiresDeposit, depositAmount } = this.computeCodDeposit(
        amount,
        settings,
      );
      if (!requiresDeposit) {
        throw new BadRequestException(
          'This order does not require a cash-on-delivery deposit',
        );
      }
      amount = depositAmount;
    }

    try {
      const { data } = await axios.post<PaystackInitializeResponse>(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email,
          amount: Math.round(amount * 100), // Paystack uses kobo (1 KES = 100 kobo)
          currency: 'KES',
          reference: `${orderNumber}-${Date.now()}`,
          metadata: { orderNumber },
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const { authorization_url, access_code, reference } = data.data;

      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'PAYSTACK',
          status: 'PENDING',
          amount,
          currency: 'KES',
          isDeposit: codDeposit,
          transactionReference: reference,
          transactions: {
            create: {
              provider: 'PAYSTACK',
              requestPayload: { orderNumber, email },
              responsePayload: data.data,
              status: 'PENDING',
            },
          },
        },
      });

      return {
        authorizationUrl: authorization_url,
        accessCode: access_code,
        reference,
      };
    } catch (error) {
      const paystackMsg = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ??
          error.message)
        : (error as Error).message || 'Unknown error';
      this.logger.error(
        'Paystack error:',
        axios.isAxiosError(error)
          ? error.response?.data
          : (error as Error).message,
      );
      throw new BadRequestException(`Paystack error: ${paystackMsg}`);
    }
  }

  async verifyPaystack(reference: string) {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    const { data } = await axios.get<PaystackVerifyResponse>(
      `${this.paystackBaseUrl}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );

    return data.data;
  }

  // ─── PayPal ──────────────────────────────────────────────────────────────────

  async initiatePaypal(orderNumber: string, userId: string) {
    const order = await this.findOrder(orderNumber, userId);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending payment');
    }

    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const mode = this.configService.get<string>('PAYPAL_MODE', 'sandbox');

    if (!clientId || !clientSecret) {
      throw new BadRequestException('PayPal is not configured');
    }

    const frontendUrl = getPrimaryFrontendUrl(this.configService);
    const baseUrl =
      mode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const { data: authData } = await axios.post<OAuthTokenResponse>(
      `${baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { data: paypalOrder } = await axios.post<PaypalOrderResponse>(
      `${baseUrl}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderNumber,
            amount: {
              currency_code: 'USD',
              value: (Number(order.total) / 130).toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: `${frontendUrl}/payment/${orderNumber}?paypal=return`,
          cancel_url: `${frontendUrl}/payment/${orderNumber}`,
          user_action: 'PAY_NOW',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'PAYPAL',
        status: 'PENDING',
        amount: order.total,
        currency: 'USD',
        transactionReference: paypalOrder.id,
        transactions: {
          create: {
            provider: 'PAYPAL',
            requestPayload: { orderNumber },
            responsePayload: paypalOrder as unknown as Prisma.InputJsonValue,
            status: 'PENDING',
          },
        },
      },
    });

    return {
      paypalOrderId: paypalOrder.id,
      approvalUrl: paypalOrder.links.find((l) => l.rel === 'approve')?.href,
    };
  }

  async capturePaypal(orderNumber: string, token: string, userId: string) {
    const order = await this.findOrder(orderNumber, userId);

    const payment = order.payments.find(
      (p) =>
        p.method === 'PAYPAL' &&
        p.transactionReference === token &&
        p.status === 'PENDING',
    );

    if (!payment) {
      throw new BadRequestException(
        'No pending PayPal payment found for this order',
      );
    }

    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const mode = this.configService.get<string>('PAYPAL_MODE', 'sandbox');

    const baseUrl =
      mode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
      const { data: authData } = await axios.post<OAuthTokenResponse>(
        `${baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { data: captureData } = await axios.post<PaypalCaptureResponse>(
        `${baseUrl}/v2/checkout/orders/${token}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (captureData.status === 'COMPLETED') {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED', paidAt: new Date() },
        });

        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CONFIRMED',
            statusHistory: {
              create: { status: 'CONFIRMED', changedBy: 'system' },
            },
          },
        });

        await this.inventoryService.fulfillOrder(order.id);
        await this.sendOrderConfirmationEmail(order.id);

        const transaction = await this.prisma.transaction.findFirst({
          where: { paymentId: payment.id, provider: 'PAYPAL' },
        });

        if (transaction) {
          await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'COMPLETED',
              responsePayload: captureData as unknown as Prisma.InputJsonValue,
            },
          });
        }

        return {
          success: true,
          message: 'PayPal payment captured successfully',
        };
      } else {
        throw new BadRequestException(
          `Payment capture failed: ${captureData.status}`,
        );
      }
    } catch (error) {
      this.logger.error(
        'PayPal capture error:',
        axios.isAxiosError(error)
          ? error.response?.data
          : (error as Error).message,
      );
      throw new BadRequestException('Failed to capture PayPal payment');
    }
  }

  // ─── Bank Transfer ───────────────────────────────────────────────────────────

  async initiateBankTransfer(orderNumber: string, userId: string) {
    const order = await this.findOrder(orderNumber, userId);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending payment');
    }

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        amount: order.total,
        currency: 'KES',
        transactions: {
          create: {
            provider: 'BANK_TRANSFER',
            requestPayload: { orderNumber },
            status: 'PENDING',
          },
        },
      },
    });

    return {
      message: 'Please transfer to the bank account details provided.',
      bankDetails: {
        bankName: 'NCBA Bank',
        accountName: 'Movec Store Ltd',
        accountNumber: '1234567890',
        branch: 'Nairobi CBD',
        reference: orderNumber,
      },
    };
  }

  // Admin-only (enforced at the route via @Roles(ADMIN), see AdminPaymentsController):
  // confirming a bank transfer means staff have checked the actual bank statement and
  // seen the money land, so it deliberately does not go through findOrder()'s
  // customer-ownership check — an admin confirms any customer's transfer, not just
  // orders that happen to be "theirs".
  async confirmBankTransfer(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { payments: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    const payment = order.payments.find(
      (p) => p.method === 'BANK_TRANSFER' && p.status === 'PENDING',
    );

    if (!payment) {
      throw new BadRequestException('No pending bank transfer payment found');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        statusHistory: { create: { status: 'CONFIRMED', changedBy: 'admin' } },
      },
    });

    await this.inventoryService.fulfillOrder(order.id);
    await this.sendOrderConfirmationEmail(order.id);

    return { message: 'Payment confirmed. Order is now confirmed.' };
  }

  // ─── Cash on Delivery ────────────────────────────────────────────────────────

  private readonly paymentSettingsId = 'singleton';

  async getPaymentSettings() {
    return this.prisma.paymentSettings.upsert({
      where: { id: this.paymentSettingsId },
      create: { id: this.paymentSettingsId },
      update: {},
    });
  }

  async updatePaymentSettings(dto: {
    codEnabled?: boolean;
    codDepositThreshold?: number;
    codDepositPercentage?: number;
  }) {
    return this.prisma.paymentSettings.upsert({
      where: { id: this.paymentSettingsId },
      create: { id: this.paymentSettingsId, ...dto },
      update: dto,
    });
  }

  // A deposit only kicks in once the order total clears the admin-configured
  // threshold — a threshold of 0 (the default) means COD never requires one.
  private computeCodDeposit(
    total: number,
    settings: {
      codDepositThreshold: Prisma.Decimal;
      codDepositPercentage: Prisma.Decimal;
    },
  ) {
    const threshold = settings.codDepositThreshold.toNumber();
    const percentage = settings.codDepositPercentage.toNumber();
    const requiresDeposit =
      threshold > 0 && percentage > 0 && total > threshold;
    const depositAmount = requiresDeposit
      ? Math.round(total * (percentage / 100) * 100) / 100
      : 0;
    return { requiresDeposit, depositAmount };
  }

  async getCodTerms(orderNumber: string, userId: string) {
    const order = await this.findOrder(orderNumber, userId);
    const settings = await this.getPaymentSettings();
    const total = order.total.toNumber();
    const { requiresDeposit, depositAmount } = this.computeCodDeposit(
      total,
      settings,
    );

    return {
      codEnabled: settings.codEnabled,
      depositThreshold: settings.codDepositThreshold.toNumber(),
      depositPercentage: settings.codDepositPercentage.toNumber(),
      requiresDeposit,
      depositAmount,
      balanceDue: total - depositAmount,
      total,
    };
  }

  // Full cash-on-delivery with no deposit due: confirms the order immediately,
  // same as any other successful payment, with the entire total collected at
  // delivery. If a deposit is required the caller must pay it online first (see
  // initiatePaystack's codDeposit option) — this endpoint refuses in that case.
  async initiateCashOnDelivery(orderNumber: string, userId: string) {
    const order = await this.findOrder(orderNumber, userId);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending payment');
    }

    const settings = await this.getPaymentSettings();
    if (!settings.codEnabled) {
      throw new BadRequestException(
        'Cash on delivery is not available right now',
      );
    }

    const total = order.total.toNumber();
    const { requiresDeposit, depositAmount } = this.computeCodDeposit(
      total,
      settings,
    );
    if (requiresDeposit) {
      throw new BadRequestException(
        `A deposit of ${depositAmount} is required before this order can be confirmed for cash on delivery`,
      );
    }

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'CASH_ON_DELIVERY',
        status: 'PENDING',
        amount: order.total,
        currency: 'KES',
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        statusHistory: {
          create: { status: 'CONFIRMED', changedBy: 'system' },
        },
      },
    });

    await this.inventoryService.fulfillOrder(order.id);
    await this.sendOrderConfirmationEmail(order.id);

    return {
      message: 'Order confirmed. Pay the full amount in cash on delivery.',
    };
  }

  // Called right after any online payment (M-Pesa, Paystack, PayPal) that was
  // flagged isDeposit completes — it books the remainder of the order total as a
  // CASH_ON_DELIVERY payment due at delivery, so the deposit + this balance always
  // add up to the order total.
  async recordCodBalanceIfDeposit(payment: {
    id: string;
    orderId: string;
    amount: Prisma.Decimal;
    currency: string;
    isDeposit: boolean;
  }) {
    if (!payment.isDeposit) return;

    const order = await this.prisma.order.findUnique({
      where: { id: payment.orderId },
    });
    if (!order) return;

    const balance = order.total.toNumber() - payment.amount.toNumber();
    if (balance <= 0) return;

    await this.prisma.payment.create({
      data: {
        orderId: payment.orderId,
        method: 'CASH_ON_DELIVERY',
        status: 'PENDING',
        amount: balance,
        currency: payment.currency,
      },
    });
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────

  async getTransactions() {
    return this.prisma.transaction.findMany({
      include: { payment: { include: { order: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Paystack HMAC verification ──────────────────────────────────────────────

  verifyPaystackSignature(rawBody: string, signature: string): boolean {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) return false;
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');
    return hash === signature;
  }
}
