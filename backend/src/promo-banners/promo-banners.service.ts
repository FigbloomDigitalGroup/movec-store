import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PromoBannersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.promoBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  async findAllAdmin() {
    return this.prisma.promoBanner.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
          },
        },
      },
    });
  }

  // Only reachable via the public, unguarded GET /promo-banners/:id route — must
  // respect isActive the same way findAll() does, or a banner an admin has
  // deliberately hidden (a draft, or a retired promotion) stays fetchable by
  // anyone who has or guesses its id.
  async findOne(id: string) {
    return this.prisma.promoBanner.findFirst({
      where: { id, isActive: true },
      include: {
        product: true,
      },
    });
  }

  async create(data: Prisma.PromoBannerCreateInput) {
    return this.prisma.promoBanner.create({
      data,
      include: {
        product: true,
      },
    });
  }

  async update(id: string, data: Prisma.PromoBannerUpdateInput) {
    return this.prisma.promoBanner.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.promoBanner.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      this.prisma.promoBanner.update({
        where: { id },
        data: { sortOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);
    return { message: 'Banners reordered successfully' };
  }
}
