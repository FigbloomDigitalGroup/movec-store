import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ModulesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  private readonly CACHE_KEY_ALL = 'modules:all';

  private getCacheKeySlug(slug: string) {
    return `modules:${slug}`;
  }

  private async clearModuleCache(slug?: string) {
    await this.cacheManager.del(this.CACHE_KEY_ALL);
    if (slug) {
      await this.cacheManager.del(this.getCacheKeySlug(slug));
    }
  }

  /** List all active store modules ordered by sortOrder */
  async findAll() {
    const cached = await this.cacheManager.get(this.CACHE_KEY_ALL);
    if (cached) return cached;

    const data = await this.prisma.storeModule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        categories: {
          orderBy: { name: 'asc' },
        },
        _count: { select: { products: true } },
      },
    });

    await this.cacheManager.set(this.CACHE_KEY_ALL, data, 15 * 60 * 1000);
    return data;
  }

  /** Get a single module by slug, including its categories */
  async findOne(slug: string) {
    const cacheKey = this.getCacheKeySlug(slug);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const mod = await this.prisma.storeModule.findUnique({
      where: { slug },
      include: {
        categories: { orderBy: { name: 'asc' } },
        _count: { select: { products: true } },
      },
    });
    if (!mod) throw new NotFoundException(`Module "${slug}" not found`);

    await this.cacheManager.set(cacheKey, mod, 15 * 60 * 1000);
    return mod;
  }

  /** Get all products belonging to a module (with full filtering) */
  async findProducts(
    slug: string,
    query: {
      page?: string;
      limit?: string;
      search?: string;
      category?: string;
      brand?: string;
      minPrice?: string;
      maxPrice?: string;
      sortBy?: string;
      order?: string;
    },
  ) {
    const mod = await this.prisma.storeModule.findUnique({ where: { slug } });
    if (!mod) throw new NotFoundException(`Module "${slug}" not found`);

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      OR: [
        { moduleId: mod.id },
        { categories: { some: { category: { moduleId: mod.id } } } },
      ],
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.categories = { some: { category: { slug: query.category } } };
    }

    if (query.brand) {
      where.brand = { slug: query.brand };
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
    }

    const sortBy = query.sortBy || 'createdAt';
    const orderDir = query.order === 'asc' ? 'asc' : 'desc';
    const orderBy: any = { [sortBy]: orderDir };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          brand: true,
          categories: {
            include: { category: true },
          },
          inventory: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const productIds = products.map((p) => p.id);
    const ratingAggregates = productIds.length
      ? await this.prisma.review.groupBy({
          by: ['productId'],
          where: { productId: { in: productIds }, isApproved: true },
          _avg: { rating: true },
          _count: { rating: true },
        })
      : [];
    const ratings = new Map(
      ratingAggregates.map((r) => [
        r.productId,
        { avgRating: r._avg.rating, reviewCount: r._count.rating },
      ]),
    );

    return {
      module: mod,
      data: products.map((p) => ({
        ...p,
        price: p.price.toNumber(),
        compareAtPrice: p.compareAtPrice?.toNumber(),
        categories: p.categories.map((pc) => pc.category),
        ...(ratings.get(p.id) ?? { avgRating: null, reviewCount: 0 }),
      })),
      meta: { page, limit, total },
    };
  }

  // ─── Admin CRUD ──────────────────────────────────────────────────

  async create(dto: CreateModuleDto) {
    const existing = await this.prisma.storeModule.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Module slug already exists');
    const created = await this.prisma.storeModule.create({ data: dto });
    await this.clearModuleCache(dto.slug);
    return created;
  }

  async update(id: string, dto: UpdateModuleDto) {
    const mod = await this.prisma.storeModule.findUnique({ where: { id } });
    if (!mod) throw new NotFoundException('Module not found');
    const updated = await this.prisma.storeModule.update({ where: { id }, data: dto });
    await this.clearModuleCache(mod.slug);
    if (dto.slug && dto.slug !== mod.slug) {
      await this.clearModuleCache(dto.slug);
    }
    return updated;
  }

  async remove(id: string) {
    const mod = await this.prisma.storeModule.findUnique({ where: { id } });
    if (!mod) throw new NotFoundException('Module not found');
    await this.prisma.storeModule.delete({ where: { id } });
    await this.clearModuleCache(mod.slug);
    return { message: 'Module deleted' };
  }
}
