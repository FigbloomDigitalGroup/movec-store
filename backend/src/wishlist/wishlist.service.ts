import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price.toNumber(),
      image: item.product.images[0]?.url || null,
      addedAt: item.createdAt,
    }));
  }

  async addItem(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      return { message: 'Product already in wishlist' };
    }

    await this.prisma.wishlistItem.create({
      data: { userId, productId },
    });

    return this.getWishlist(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.wishlistItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) throw new NotFoundException('Wishlist item not found');

    await this.prisma.wishlistItem.delete({ where: { id: itemId } });

    return this.getWishlist(userId);
  }
}