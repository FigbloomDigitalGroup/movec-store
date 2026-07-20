import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  /** List all active store modules ordered by sortOrder */
  async findAll() {
    return this.prisma.storeModule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        categories: {
          orderBy: { name: 'asc' },
        },
        _count: { select: { products: true } },
      },
    });
  }

  /** Get a single module by slug, including its categories */
  async findOne(slug: string) {
    const mod = await this.prisma.storeModule.findUnique({
      where: { slug },
      include: {
        categories: { orderBy: { name: 'asc' } },
        _count: { select: { products: true } },
      },
    });
    if (!mod) throw new NotFoundException(`Module "${slug}" not found`);
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
      moduleId: mod.id,
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
          images: true,
          brand: true,
          module: true,
          categories: { include: { category: true } },
          inventory: { include: { warehouse: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      module: mod,
      data: products.map((p) => ({
        ...p,
        price: p.price.toNumber(),
        compareAtPrice: p.compareAtPrice?.toNumber(),
        categories: p.categories.map((pc) => pc.category),
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
    return this.prisma.storeModule.create({ data: dto });
  }

  async update(id: string, dto: UpdateModuleDto) {
    const mod = await this.prisma.storeModule.findUnique({ where: { id } });
    if (!mod) throw new NotFoundException('Module not found');
    return this.prisma.storeModule.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const mod = await this.prisma.storeModule.findUnique({ where: { id } });
    if (!mod) throw new NotFoundException('Module not found');
    await this.prisma.storeModule.delete({ where: { id } });
    return { message: 'Module deleted' };
  }
}
