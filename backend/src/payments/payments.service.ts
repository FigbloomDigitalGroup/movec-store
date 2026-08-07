import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private inventoryService: InventoryService,
  ) {}

  private async findOrder(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { payments: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ─── M-Pesa ─────────────────────────────────────────────────────────────────

  async initiateMpesa(orderNumber: string, phoneNumber: string) {
    const order = await this.findOrder(orderNumber);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending payment');
    }

    const consumerKey = this.configService.get<string>('MPESA_CONSUMER_KEY');
    const consumerSecret = this.configService.get<string>('MPESA_CONSUMER_SECRET');
    const passkey = this.configService.get<string>('MPESA_PASSKEY');
    const shortcode = this.configService.get<string>('MPESA_SHORTCODE');
    const callbackUrl = this.configService.get<string>('MPESA_CALLBACK_URL');

    if (!consumerKey || !consumerSecret) {
      throw new BadRequestException('M-Pesa is not configured');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
      const { data: authData } = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        { headers: { Authorization: `Basic ${auth}` } },
      );

      const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

      const stkPayload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(Number(order.total)),
        PartyA: phoneNumber.replace(/^\+254/, '254').replace(/^0/, '254'),
        PartyB: shortcode,
        PhoneNumber: phoneNumber.replace(/^\+254/, '254').replace(/^0/, '254'),
        CallBackURL: callbackUrl || 'https://example.com/callback',
        AccountReference: orderNumber,
        TransactionDesc: `Payment for ${orderNumber}`,
      };

      const { data: stkData } = await axios.post(
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
              requestPayload: stkPayload as any,
              responsePayload: stkData as any,
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
      this.logger.error('M-Pesa error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to initiate M-Pesa payment');
    }
  }

  // ─── Paystack ────────────────────────────────────────────────────────────────

  async initiatePaystack(orderNumber: string, email: string) {
    const order = await this.findOrder(orderNumber);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending payment');
    }

    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new BadRequestException('Paystack is not configured');
    }

    try {
      const { data } = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email,
          amount: Math.round(Number(order.total) * 100), // Paystack uses kobo (1 KES = 100 kobo)
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
          amount: order.total,
          currency: 'KES',
          transactionReference: reference,
          transactions: {
            create: {
              provider: 'PAYSTACK',
              requestPayload: { orderNumber, email } as any,
              responsePayload: data.data as any,
              status: 'PENDING',
            },
          },
        },
      });

      return { authorizationUrl: authorization_url, accessCode: access_code, reference };
    } catch (error: any) {
      const paystackMsg = error.response?.data?.message || error.message || 'Unknown error';
      this.logger.error('Paystack error:', error.response?.data || error.message);
      throw new BadRequestException(`Paystack error: ${paystackMsg}`);
    }
  }

  async verifyPaystack(reference: string) {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    const { data } = await axios.get(
      `${this.paystackBaseUrl}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );

    return data.data;
  }

  // ─── PayPal ──────────────────────────────────────────────────────────────────

  async initiatePaypal(orderNumber: string) {
    const order = await this.findOrder(orderNumber);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending payment');
    }

    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const mode = this.configService.get<string>('PAYPAL_MODE', 'sandbox');

    if (!clientId || !clientSecret) {
      throw new BadRequestException('PayPal is not configured');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const { data: authData } = await axios.post(
      `${baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const { data: paypalOrder } = await axios.post(
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
      { headers: { Authorization: `Bearer ${authData.access_token}`, 'Content-Type': 'application/json' } },
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
            requestPayload: { orderNumber } as any,
            responsePayload: paypalOrder as any,
            status: 'PENDING',
          },
        },
      },
    });

    return {
      paypalOrderId: paypalOrder.id,
      approvalUrl: paypalOrder.links.find((l: any) => l.rel === 'approve')?.href,
    };
  }

  async capturePaypal(orderNumber: string, token: string) {
    const order = await this.findOrder(orderNumber);

    const payment = order.payments.find(
      (p) => p.method === 'PAYPAL' && p.transactionReference === token && p.status === 'PENDING',
    );

    if (!payment) {
      throw new BadRequestException('No pending PayPal payment found for this order');
    }

    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const mode = this.configService.get<string>('PAYPAL_MODE', 'sandbox');

    const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
      const { data: authData } = await axios.post(
        `${baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const { data: captureData } = await axios.post(
        `${baseUrl}/v2/checkout/orders/${token}/capture`,
        {},
        { headers: { Authorization: `Bearer ${authData.access_token}`, 'Content-Type': 'application/json' } },
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
            statusHistory: { create: { status: 'CONFIRMED', changedBy: 'system' } },
          },
        });

        await this.inventoryService.fulfillOrder(order.id);

        const transaction = await this.prisma.transaction.findFirst({
          where: { paymentId: payment.id, provider: 'PAYPAL' },
        });

        if (transaction) {
          await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'COMPLETED', responsePayload: captureData as any },
          });
        }

        return { success: true, message: 'PayPal payment captured successfully' };
      } else {
        throw new BadRequestException(`Payment capture failed: ${captureData.status}`);
      }
    } catch (error) {
      this.logger.error('PayPal capture error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to capture PayPal payment');
    }
  }

  // ─── Bank Transfer ───────────────────────────────────────────────────────────

  async initiateBankTransfer(orderNumber: string) {
    const order = await this.findOrder(orderNumber);

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
            requestPayload: { orderNumber } as any,
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

  async confirmBankTransfer(orderNumber: string) {
    const order = await this.findOrder(orderNumber);
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

    return { message: 'Payment confirmed. Order is now confirmed.' };
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
    const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
    return hash === signature;
  }
}