import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({ include: { _count: { select: { products: true } } } });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(dto: CreateBrandDto) {
    const existing = await this.prisma.brand.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug already exists');
    return this.prisma.brand.create({ data: dto });
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id);
    return this.prisma.brand.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.brand.delete({ where: { id } });
    return { message: 'Brand deleted' };
  }
}