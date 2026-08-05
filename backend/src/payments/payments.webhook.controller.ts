import { Controller, Post, Body, Headers, Logger, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { PaymentsService } from './payments.service';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);

  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private paymentsService: PaymentsService,
  ) {}

  // ─── M-Pesa Callback ─────────────────────────────────────────────────────────

  @Post('mpesa/callback')
  async mpesaCallback(@Body() body: any) {
    this.logger.log('M-Pesa callback received');

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

          await this.inventoryService.fulfillOrder(transaction.payment.orderId);
        }
      }
    }

    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  // ─── Paystack Webhook ────────────────────────────────────────────────────────

  @Post('paystack/webhook')
  async paystackWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    this.logger.log(`Paystack webhook: ${body.event}`);

    // Verify signature using raw body
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);
    const isValid = this.paymentsService.verifyPaystackSignature(rawBody, signature);

    if (!isValid) {
      this.logger.warn('Invalid Paystack webhook signature');
      return { received: false };
    }

    if (body.event === 'charge.success') {
      const data = body.data;
      const reference = data.reference;
      const orderNumber = data.metadata?.orderNumber;

      const payment = await this.prisma.payment.findFirst({
        where: { transactionReference: reference },
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

        await this.inventoryService.fulfillOrder(payment.orderId);

        // Update transaction record
        const transaction = await this.prisma.transaction.findFirst({
          where: { paymentId: payment.id, provider: 'PAYSTACK' },
        });
        if (transaction) {
          await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'COMPLETED', responsePayload: data },
          });
        }

        this.logger.log(`Order ${orderNumber} confirmed via Paystack`);
      }
    }

    return { received: true };
  }
}