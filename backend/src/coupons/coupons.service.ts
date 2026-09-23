import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import {
  buildPagination,
  paginated,
  type PaginationQuery,
} from '../common/pagination';

// Checkout (checkout.service.ts) looks coupon codes up with an exact,
// case-sensitive match — never normalize case here, or an admin-created
// code could silently stop matching what a customer actually types.
@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQuery & { search?: string }) {
    const { page, limit, skip } = buildPagination(query);
    const where = query.search
      ? {
          code: { contains: query.search.trim(), mode: 'insensitive' as const },
        }
      : {};

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return paginated(coupons, total, page, limit);
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async create(dto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: {
        code: dto.code.trim(),
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderAmount: dto.minOrderAmount,
        maxUsage: dto.maxUsage,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.code !== undefined ? { code: dto.code.trim() } : {}),
        ...(dto.discountType !== undefined
          ? { discountType: dto.discountType }
          : {}),
        ...(dto.discountValue !== undefined
          ? { discountValue: dto.discountValue }
          : {}),
        ...(dto.minOrderAmount !== undefined
          ? { minOrderAmount: dto.minOrderAmount }
          : {}),
        ...(dto.maxUsage !== undefined ? { maxUsage: dto.maxUsage } : {}),
        ...(dto.startsAt !== undefined
          ? { startsAt: new Date(dto.startsAt) }
          : {}),
        ...(dto.expiresAt !== undefined
          ? { expiresAt: new Date(dto.expiresAt) }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  // A coupon that's already been redeemed stays around (deactivate instead,
  // via update) so past orders keep an intact link and reporting doesn't
  // silently lose which code drove which discount. Only a never-used coupon
  // can actually be removed.
  async remove(id: string) {
    const coupon = await this.findOne(id);
    if (coupon.usedCount > 0) {
      throw new BadRequestException(
        'This coupon has already been used and cannot be deleted — deactivate it instead.',
      );
    }
    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Coupon deleted' };
  }
}
