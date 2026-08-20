import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  Req,
  Query,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { PaymentsService } from './payments.service';
import type { Request } from 'express';
import { Prisma } from '@prisma/client';

interface MpesaStkCallbackItem {
  Name: string;
  Value?: string | number;
}

interface MpesaCallbackBody {
  Body?: {
    stkCallback?: {
      CheckoutRequestID: string;
      ResultCode: number;
      CallbackMetadata?: { Item?: MpesaStkCallbackItem[] };
    };
  };
}

interface PaystackWebhookBody {
  event: string;
  data: {
    reference: string;
    metadata?: { orderNumber?: string };
  };
}

@Controller('payments')
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);

  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private paymentsService: PaymentsService,
    private configService: ConfigService,
  ) {}

  // ─── M-Pesa Callback ─────────────────────────────────────────────────────────

  @Post('mpesa/callback')
  async mpesaCallback(
    @Body() body: MpesaCallbackBody,
    @Query('secret') secret: string,
  ) {
    this.logger.log('M-Pesa callback received');

    // Safaricom's STK callback has no signature of its own, so the shared secret
    // stamped onto the callback URL at initiation time (see PaymentsService.initiateMpesa)
    // is what stands in for authentication here. Without it, anyone who finds this
    // URL could forge a "payment succeeded" callback for any order.
    const expectedSecret = this.configService.get<string>(
      'MPESA_CALLBACK_SECRET',
    );
    if (expectedSecret) {
      if (secret !== expectedSecret) {
        this.logger.warn('Rejected M-Pesa callback: missing or invalid secret');
        return { ResultCode: 1, ResultDesc: 'Rejected' };
      }
    } else {
      this.logger.warn(
        'MPESA_CALLBACK_SECRET is not set — the M-Pesa callback endpoint is currently unauthenticated. Set MPESA_CALLBACK_SECRET to secure it.',
      );
    }

    if (body.Body?.stkCallback) {
      const callback = body.Body.stkCallback;
      const checkoutRequestId = callback.CheckoutRequestID;
      const resultCode = callback.ResultCode;

      const transaction = await this.prisma.transaction.findFirst({
        where: {
          provider: 'MPESA',
          responsePayload: {
            path: ['CheckoutRequestID'],
            equals: checkoutRequestId,
          },
        },
        include: { payment: true },
      });

      // Safaricom may redeliver the same callback more than once — only act on it
      // the first time. Once the transaction has left PENDING, later deliveries are
      // acknowledged but ignored so we never double-fulfil the same order.
      if (transaction && transaction.status === 'PENDING') {
        let amountMismatch = false;
        if (resultCode === 0) {
          const items = callback.CallbackMetadata?.Item ?? [];
          const callbackAmount = items.find((i) => i.Name === 'Amount')?.Value;
          const expectedAmount = Number(transaction.payment.amount);
          amountMismatch =
            callbackAmount == null ||
            Math.abs(Number(callbackAmount) - expectedAmount) >= 1;
          if (amountMismatch) {
            this.logger.warn(
              `M-Pesa callback amount mismatch for ${checkoutRequestId}: expected ${expectedAmount}, got ${callbackAmount}`,
            );
          }
        }

        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status:
              resultCode === 0 && !amountMismatch ? 'COMPLETED' : 'FAILED',
            responsePayload: callback as unknown as Prisma.InputJsonValue,
          },
        });

        if (resultCode === 0 && !amountMismatch) {
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
    @Body() body: PaystackWebhookBody,
    @Headers('x-paystack-signature') signature: string,
  ) {
    this.logger.log(`Paystack webhook: ${body.event}`);

    // Verify signature using raw body
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);
    const isValid = this.paymentsService.verifyPaystackSignature(
      rawBody,
      signature,
    );

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
            data: {
              status: 'COMPLETED',
              responsePayload: data,
            },
          });
        }

        this.logger.log(`Order ${orderNumber} confirmed via Paystack`);
      }
    }

    return { received: true };
  }
}
