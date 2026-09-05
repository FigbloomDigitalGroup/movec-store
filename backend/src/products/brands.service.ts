import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async clearBrandCache() {
    await this.cacheManager.del('brands:all');
  }

  private async fetchAllBrands() {
    return this.prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
    });
  }

  async findAll() {
    const cacheKey = 'brands:all';
    const cached =
      await this.cacheManager.get<
        Awaited<ReturnType<typeof this.fetchAllBrands>>
      >(cacheKey);
    if (cached) return cached;

    const data = await this.fetchAllBrands();
    await this.cacheManager.set(cacheKey, data, 15 * 60 * 1000);
    return data;
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(dto: CreateBrandDto) {
    const existing = await this.prisma.brand.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug already exists');
    const created = await this.prisma.brand.create({ data: dto });
    await this.clearBrandCache();
    return created;
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id);
    const updated = await this.prisma.brand.update({
      where: { id },
      data: dto,
    });
    await this.clearBrandCache();
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.brand.delete({ where: { id } });
    await this.clearBrandCache();
    return { message: 'Brand deleted' };
  }
}
