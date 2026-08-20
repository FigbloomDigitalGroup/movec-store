import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { InventoryService } from '../inventory/inventory.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private inventoryService: InventoryService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.cartService.getCart(userId);

    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    const shippingAddress = await this.prisma.address.findFirst({
      where: { id: dto.shippingAddressId, userId },
    });
    if (!shippingAddress)
      throw new NotFoundException('Shipping address not found');

    const billingAddress = await this.prisma.address.findFirst({
      where: { id: dto.billingAddressId, userId },
    });
    if (!billingAddress)
      throw new NotFoundException('Billing address not found');

    const subtotal = cart.total;
    let discountAmount = 0;
    let couponId: string | null = null;

    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
      });

      if (!coupon || !coupon.isActive) {
        throw new BadRequestException('Invalid coupon code');
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        throw new BadRequestException('Coupon has expired');
      }

      if (coupon.startsAt && new Date(coupon.startsAt) > new Date()) {
        throw new BadRequestException('Coupon is not yet active');
      }

      if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
        throw new BadRequestException('Coupon usage limit reached');
      }

      if (coupon.minOrderAmount) {
        const minAmount = coupon.minOrderAmount.toNumber();
        if (subtotal < minAmount) {
          throw new BadRequestException(
            `Minimum order amount of ${minAmount} required`,
          );
        }
      }

      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = subtotal * (coupon.discountValue.toNumber() / 100);
      } else {
        discountAmount = coupon.discountValue.toNumber();
      }

      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }

      couponId = coupon.id;
    }

    const shippingCost = subtotal >= 20000 ? 0 : 500;
    const taxAmount = subtotal * 0.16;
    const total = subtotal - discountAmount + shippingCost + taxAmount;

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const maxUsageAtReadTime = couponId
      ? (await this.prisma.coupon.findUnique({ where: { id: couponId } }))
          ?.maxUsage
      : null;

    const order = await this.prisma.$transaction(async (tx) => {
      // Reserve real stock for every line before the order exists — this is what
      // stops N different customers from all checking out the same last unit: each
      // reservation is an atomic conditional update, so once stock runs out the
      // remaining attempts fail here and roll back cleanly instead of all "succeeding".
      for (const item of cart.items) {
        await this.inventoryService.reserveStock(
          tx,
          item.productId,
          item.quantity,
        );
      }

      if (couponId) {
        // Re-check + increment maxUsage atomically, inside the same transaction as
        // the stock reservation — otherwise two concurrent checkouts could both pass
        // the earlier read-only check and both use up a coupon meant for one order.
        const couponUpdate = await tx.coupon.updateMany({
          where: {
            id: couponId,
            OR: [
              { maxUsage: null },
              { usedCount: { lt: maxUsageAtReadTime ?? undefined } },
            ],
          },
          data: { usedCount: { increment: 1 } },
        });
        if (couponUpdate.count === 0) {
          throw new BadRequestException('Coupon usage limit reached');
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          subtotal,
          shippingCost,
          taxAmount,
          discountAmount,
          total,
          couponId,
          shippingAddressId: dto.shippingAddressId,
          billingAddressId: dto.billingAddressId,
          notes: dto.notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productNameSnapshot: item.name,
              productSkuSnapshot: item.sku ?? '',
              priceSnapshot: item.price,
              quantity: item.quantity,
            })),
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              changedBy: userId,
            },
          },
        },
        include: {
          items: true,
          shippingAddress: true,
          billingAddress: true,
        },
      });

      await this.cartService.clearCart(userId, tx);

      return created;
    });

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      total,
      items: order.items,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      createdAt: order.createdAt,
    };
  }
}
