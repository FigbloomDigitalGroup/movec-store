import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { OrderStatus } from '@prisma/client';
import { buildPagination, paginated, type PaginationQuery } from '../common/pagination';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async findByCustomer(userId: string, query: PaginationQuery) {
    const { page, limit, skip } = buildPagination(query);
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                include: { images: { where: { isPrimary: true }, take: 1 } },
              },
            },
          },
          payments: { select: { method: true, status: true, amount: true } },
          shipping: true,
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return paginated(
      orders.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        subtotal: o.subtotal.toNumber(),
        shippingCost: o.shippingCost.toNumber(),
        taxAmount: o.taxAmount.toNumber(),
        discountAmount: o.discountAmount.toNumber(),
        total: o.total.toNumber(),
        items: o.items.map((i) => ({
          productName: i.productNameSnapshot,
          price: i.priceSnapshot.toNumber(),
          quantity: i.quantity,
          image: i.product.images[0]?.url || null,
        })),
        payment: o.payments[0] || null,
        shipping: o.shipping,
        createdAt: o.createdAt,
      })),
      total,
      page,
      limit,
    );
  }

  async findByOrderNumber(orderNumber: string, userId?: string) {
    const where: any = { orderNumber };
    if (userId) where.userId = userId;

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
        payments: true,
        shipping: true,
        shippingAddress: true,
        billingAddress: true,
        statusHistory: { orderBy: { changedAt: 'asc' } },
        coupon: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal.toNumber(),
      shippingCost: order.shippingCost.toNumber(),
      taxAmount: order.taxAmount.toNumber(),
      discountAmount: order.discountAmount.toNumber(),
      total: order.total.toNumber(),
      notes: order.notes,
      items: order.items.map((i) => ({
        productName: i.productNameSnapshot,
        price: i.priceSnapshot.toNumber(),
        quantity: i.quantity,
        image: i.product.images[0]?.url || null,
        productId: i.productId,
        slug: i.product.slug,
      })),
      payments: order.payments,
      shipping: order.shipping,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      statusHistory: order.statusHistory,
      coupon: order.coupon ? { code: order.coupon.code, type: order.coupon.discountType, value: order.coupon.discountValue.toNumber() } : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async cancelOrder(orderNumber: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderNumber, userId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    const cancellable: OrderStatus[] = ['PENDING', 'CONFIRMED'];
    if (!cancellable.includes(order.status)) {
      throw new BadRequestException(`Order cannot be cancelled when status is ${order.status}`);
    }

    // PENDING means checkout only ever reserved stock (fulfillOrder never ran), so
    // cancelling releases that reservation. CONFIRMED means the order was already
    // paid and fulfilled — the stock is genuinely sold, so cancelling now needs to
    // restock it, not just release a hold that no longer exists.
    const wasFulfilled = order.status === 'CONFIRMED';

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          statusHistory: {
            create: { status: 'CANCELLED', changedBy: userId },
          },
        },
      });

      await tx.payment.updateMany({
        where: { orderId: order.id, status: 'COMPLETED' },
        data: { status: 'REFUNDED' },
      });

      await this.inventoryService.returnOrderStock(
        tx,
        order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        order.orderNumber,
        wasFulfilled,
      );
    });

    return { message: 'Order cancelled successfully' };
  }

  async findAll(page = 1, limit = 20, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          items: true,
          payments: true,
          shipping: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: o.user,
        status: o.status,
        total: o.total.toNumber(),
        itemsCount: o.items.length,
        paymentMethod: o.payments[0]?.method || null,
        paymentStatus: o.payments[0]?.status || null,
        shipping: o.shipping,
        createdAt: o.createdAt,
      })),
      meta: { page, limit, total },
    };
  }

  async updateStatus(orderId: string, status: OrderStatus, trackingNumber?: string, carrier?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const data: any = {
      status,
      statusHistory: {
        create: { status, changedBy: 'admin' },
      },
    };

    if (status === 'SHIPPED') {
      await this.prisma.shipping.upsert({
        where: { orderId },
        create: {
          orderId,
          trackingNumber: trackingNumber || '',
          carrier: carrier || '',
          shippedAt: new Date(),
        },
        update: {
          trackingNumber: trackingNumber || '',
          carrier: carrier || '',
          shippedAt: new Date(),
        },
      });
    }

    if (status === 'DELIVERED') {
      await this.prisma.shipping.upsert({
        where: { orderId },
        create: {
          orderId,
          trackingNumber: trackingNumber || '',
          carrier: carrier || '',
          deliveredAt: new Date(),
        },
        update: { deliveredAt: new Date() },
      });
    }

    await this.prisma.order.update({ where: { id: orderId }, data });

    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: true,
        shipping: true,
        statusHistory: { orderBy: { changedAt: 'asc' } },
      },
    });
  }

  async generateInvoice(orderNumber: string, userId: string) {
    const order = await this.findByOrderNumber(orderNumber, userId);

    return {
      invoiceNumber: `INV-${orderNumber}`,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      status: order.status,
      items: order.items,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      total: order.total,
      shippingAddress: order.shippingAddress,
      message: 'Invoice generated successfully',
    };
  }
}