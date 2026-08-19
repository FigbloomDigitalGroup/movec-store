import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { buildPagination, paginated } from '../common/pagination';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId: dto.productId } },
    });
    if (existing) throw new BadRequestException('You have already reviewed this product');

    return this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        rating: dto.rating,
        title: dto.title,
        body: dto.body,
      },
    });
  }

  async getProductReviews(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllReviews(query: QueryReviewDto) {
    const { page, limit, skip } = buildPagination(query);
    const where: Prisma.ReviewWhereInput = {};

    if (query.status === 'pending') where.isApproved = false;
    if (query.status === 'approved') where.isApproved = true;
    if (query.rating) where.rating = Number(query.rating);
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { body: { contains: query.search, mode: 'insensitive' } },
        { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
        { product: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    // Summary stats reflect the whole table, independent of the current search/status/
    // rating filter — the KPI cards on the admin page describe overall review health,
    // not "reviews matching what's currently typed in the search box".
    const [data, total, pendingCount, approvedCount, ratingAgg] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          product: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
      this.prisma.review.count({ where: { isApproved: false } }),
      this.prisma.review.count({ where: { isApproved: true } }),
      this.prisma.review.aggregate({ _avg: { rating: true }, _count: { _all: true } }),
    ]);

    return {
      ...paginated(data, total, page, limit),
      stats: {
        total: ratingAgg._count._all,
        pending: pendingCount,
        approved: approvedCount,
        averageRating: ratingAgg._avg.rating ?? 0,
      },
    };
  }

  async approveReview(reviewId: string) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });
  }

  async rejectReview(reviewId: string) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: false },
    });
  }

  async deleteReview(reviewId: string) {
    await this.prisma.review.delete({ where: { id: reviewId } });
    return { message: 'Review deleted' };
  }
}