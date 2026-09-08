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
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private inventoryService: InventoryService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  // Fired from every path that transitions an order to CONFIRMED (admin confirming
  // a Paybill/Till payment, or cash-on-delivery being placed). Failure to send is
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

    await this.notificationsService.notifyAdmins(
      'ORDER',
      'Payment received',
      `Payment received for order ${order.orderNumber} — KES ${Number(order.total).toLocaleString()} via ${payment?.method ?? 'unknown method'}.`,
    );
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

  // ─── Paybill / Till (manual M-Pesa) ────────────────────────────────────────
  //
  // Neither channel has a processor callback — the customer transfers the money
  // from their own phone, then an admin checks the actual M-Pesa statement and
  // confirms the order (see confirmPaybillTill / AdminPaymentsController). That
  // makes this the same trust model as the bank-transfer flow it replaces: "paid"
  // means staff have verified it, not that the customer said so.

  private readonly channelLabels = {
    PAYBILL: 'Paybill',
    TILL: 'Till Number',
  } as const;

  async initiatePaybillTill(
    orderNumber: string,
    userId: string,
    channel: 'PAYBILL' | 'TILL',
    codDeposit = false,
  ) {
    const order = await this.findOrder(orderNumber, userId);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending payment');
    }

    const settings = await this.getPaymentSettings();
    const enabled =
      channel === 'PAYBILL' ? settings.paybillEnabled : settings.tillEnabled;
    const businessNumber =
      channel === 'PAYBILL' ? settings.paybillNumber : settings.tillNumber;

    if (!enabled || !businessNumber) {
      throw new BadRequestException(
        `${this.channelLabels[channel]} payment is not available right now`,
      );
    }

    let amount = order.total.toNumber();
    if (codDeposit) {
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

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: channel,
        status: 'PENDING',
        amount,
        currency: 'KES',
        isDeposit: codDeposit,
        transactions: {
          create: {
            provider: channel,
            requestPayload: { orderNumber },
            status: 'PENDING',
          },
        },
      },
    });

    return {
      message: `Pay via M-Pesa ${this.channelLabels[channel]}, then let us know once you've sent it.`,
      channel,
      businessNumber,
      // The account number is what ties a Paybill transfer back to this order —
      // Buy Goods (Till) payments have no account-number field at all.
      accountNumber: channel === 'PAYBILL' ? orderNumber : undefined,
      amount,
    };
  }

  // Optional: lets the customer record the M-Pesa code they received after paying,
  // purely so the admin has it on hand while reconciling the statement — it is
  // never trusted to confirm the payment by itself (see confirmPaybillTill).
  async submitPaymentReference(
    orderNumber: string,
    userId: string,
    reference: string,
  ) {
    const order = await this.findOrder(orderNumber, userId);
    const payment = order.payments.find(
      (p) =>
        (p.method === 'PAYBILL' || p.method === 'TILL') &&
        p.status === 'PENDING',
    );

    if (!payment) {
      throw new BadRequestException(
        'No pending Paybill/Till payment found for this order',
      );
    }

    await this.prisma.transaction.updateMany({
      where: { paymentId: payment.id, status: 'PENDING' },
      data: {
        responsePayload: {
          customerReportedCode: reference,
        },
      },
    });

    return { message: "Thanks — we'll confirm your payment shortly." };
  }

  // Admin-only (enforced at the route via @Roles(ADMIN), see AdminPaymentsController):
  // confirming a Paybill/Till payment means staff have checked the actual M-Pesa
  // statement and seen the money land, so it deliberately does not go through
  // findOrder()'s customer-ownership check — an admin confirms any customer's
  // payment, not just orders that happen to be "theirs".
  async confirmPaybillTill(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { payments: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    const payment = order.payments.find(
      (p) =>
        (p.method === 'PAYBILL' || p.method === 'TILL') &&
        p.status === 'PENDING',
    );

    if (!payment) {
      throw new BadRequestException(
        'No pending Paybill/Till payment found for this order',
      );
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });

    await this.prisma.transaction.updateMany({
      where: { paymentId: payment.id, status: 'PENDING' },
      data: { status: 'COMPLETED' },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        statusHistory: { create: { status: 'CONFIRMED', changedBy: 'admin' } },
      },
    });

    await this.recordCodBalanceIfDeposit(payment);
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
    paybillEnabled?: boolean;
    paybillNumber?: string;
    tillEnabled?: boolean;
    tillNumber?: string;
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
  // delivery. If a deposit is required the caller must pay it via Paybill/Till
  // first (see initiatePaybillTill's codDeposit option) — this endpoint refuses
  // in that case.
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

  // Called right after any Paybill/Till payment that was flagged isDeposit
  // completes (via admin confirmation) — it books the remainder of the order total as a
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
}
