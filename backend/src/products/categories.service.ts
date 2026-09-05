import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async clearCategoryCache() {
    await this.cacheManager.del('categories:all');
  }

  private async fetchCategories(moduleSlug?: string) {
    return this.prisma.category.findMany({
      where: moduleSlug ? { module: { slug: moduleSlug } } : undefined,
      include: {
        children: true,
        parent: true,
        module: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAll(moduleSlug?: string) {
    const cacheKey = moduleSlug
      ? `categories:module:${moduleSlug}`
      : 'categories:all';
    const cached =
      await this.cacheManager.get<
        Awaited<ReturnType<typeof this.fetchCategories>>
      >(cacheKey);
    if (cached) return cached;

    const data = await this.fetchCategories(moduleSlug);
    await this.cacheManager.set(cacheKey, data, 15 * 60 * 1000);
    return data;
  }

  async findOne(id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true, parent: true, module: true },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug already exists');
    const created = await this.prisma.category.create({ data: dto });
    await this.clearCategoryCache();
    return created;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    const updated = await this.prisma.category.update({
      where: { id },
      data: dto,
    });
    await this.clearCategoryCache();
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.category.delete({ where: { id } });
    await this.clearCategoryCache();
    return { message: 'Category deleted' };
  }
}
