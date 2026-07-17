import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, { apiVersion: '2025-06-30.acacia' as any });
    }
  }

  private async findOrder(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { payments: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

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

  async initiateStripe(orderNumber: string) {
    const order = await this.findOrder(orderNumber);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending payment');
    }

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100),
      currency: 'kes',
      metadata: { orderNumber },
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'STRIPE',
        status: 'PENDING',
        amount: order.total,
        currency: 'KES',
        transactionReference: paymentIntent.id,
               transactions: {
          create: {
            provider: 'STRIPE',
            requestPayload: { orderNumber } as any,
            responsePayload: paymentIntent as any,
            status: 'PENDING',
          },
        },
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

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
        bankName: 'Example Bank',
        accountName: 'Starlink CCTV Ltd',
        accountNumber: '1234567890',
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
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        statusHistory: {
          create: { status: 'CONFIRMED', changedBy: 'admin' },
        },
      },
    });

    return { message: 'Payment confirmed. Order is now confirmed.' };
  }

  async getTransactions() {
    return this.prisma.transaction.findMany({
      include: { payment: { include: { order: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}