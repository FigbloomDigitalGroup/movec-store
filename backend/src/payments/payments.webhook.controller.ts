import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Controller('payments')
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);
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

  @Post('mpesa/callback')
  async mpesaCallback(@Body() body: any) {
    this.logger.log('M-Pesa callback:', body);

    if (body.Body?.stkCallback) {
      const callback = body.Body.stkCallback;
      const checkoutRequestId = callback.CheckoutRequestID;
      const resultCode = callback.ResultCode;

      const transaction = await this.prisma.transaction.findFirst({
        where: {
          provider: 'MPESA',
          responsePayload: { path: ['CheckoutRequestID'], equals: checkoutRequestId },
        },
        include: { payment: true },
      });

      if (transaction) {
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: resultCode === 0 ? 'COMPLETED' : 'FAILED',
            responsePayload: callback,
          },
        });

        if (resultCode === 0) {
          await this.prisma.payment.update({
            where: { id: transaction.paymentId },
            data: { status: 'COMPLETED', paidAt: new Date() },
          });

          await this.prisma.order.update({
            where: { id: transaction.payment.orderId },
            data: {
              status: 'CONFIRMED',
              statusHistory: {
                create: { status: 'CONFIRMED', changedBy: 'system' },
              },
            },
          });
        }
      }
    }

    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  @Post('stripe/webhook')
  async stripeWebhook(@Body() body: any, @Headers('stripe-signature') signature: string) {
    this.logger.log('Stripe webhook received');

    if (body.type === 'payment_intent.succeeded') {
      const paymentIntent = body.data.object;
      const payment = await this.prisma.payment.findFirst({
        where: { transactionReference: paymentIntent.id },
      });

      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED', paidAt: new Date() },
        });

        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'CONFIRMED',
            statusHistory: {
              create: { status: 'CONFIRMED', changedBy: 'system' },
            },
          },
        });
      }
    }

    return { received: true };
  }

  @Post('paypal/capture/:orderId')
  async capturePaypal(@Body() body: any) {
    this.logger.log('PayPal capture:', body);
    return { message: 'PayPal capture endpoint' };
  }
}