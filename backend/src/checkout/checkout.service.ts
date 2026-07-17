import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.cartService.getCart(userId);

    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    const shippingAddress = await this.prisma.address.findFirst({
      where: { id: dto.shippingAddressId, userId },
    });
    if (!shippingAddress) throw new NotFoundException('Shipping address not found');

    const billingAddress = await this.prisma.address.findFirst({
      where: { id: dto.billingAddressId, userId },
    });
    if (!billingAddress) throw new NotFoundException('Billing address not found');

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

    const order = await this.prisma.order.create({
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
            productSkuSnapshot: '',
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

    await this.cartService.clearCart(userId);

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