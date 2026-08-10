import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  private async generateSKU(brandId?: string): Promise<string> {
    const prefix = brandId && brandId.trim()
      ? ((await this.prisma.brand.findUnique({ where: { id: brandId } }))?.slug?.substring(0, 3).toUpperCase() ?? 'PRD')
      : 'PRD';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  }

  async findAll(query: QueryProductDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { isActive: true };

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

    if (query.module) {
      where.module = { slug: query.module };
    }

    if (query.brand) {
      where.brand = { slug: query.brand };
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
    }

    if (query.featured === 'true') {
      where.isFeatured = true;
    }

    const orderBy: any = {};
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'asc' ? 'asc' : 'desc';
    orderBy[sortBy] = order;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          brand: true,
          categories: {
            include: { category: true },
          },
          inventory: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => ({
        ...p,
        price: p.price.toNumber(),
        compareAtPrice: p.compareAtPrice?.toNumber(),
        categories: p.categories.map((pc) => pc.category),
      })),
      meta: { page, limit, total },
    };
  }

  async findAllAdmin(query: QueryProductDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

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

    if (query.module) {
      where.module = { slug: query.module };
    }

    if (query.brand) {
      where.brand = { slug: query.brand };
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
    }

    if (query.featured === 'true') {
      where.isFeatured = true;
    }

    if (query.isActive === 'true') {
      where.isActive = true;
    } else if (query.isActive === 'false') {
      where.isActive = false;
    }

    if (query.inStock === 'true') {
      where.inventory = { some: { quantity: { gt: 0 } } };
    }

    const orderBy: any = {};
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'asc' ? 'asc' : 'desc';
    orderBy[sortBy] = order;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          brand: true,
          categories: {
            include: { category: true },
          },
          inventory: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => ({
        ...p,
        price: p.price.toNumber(),
        compareAtPrice: p.compareAtPrice?.toNumber(),
        categories: p.categories.map((pc) => pc.category),
      })),
      meta: { page, limit, total },
    };
  }

  private getProductCacheKey(slug: string) {
    return `product:${slug}`;
  }

  private async clearProductCache(slug?: string) {
    if (slug) {
      await this.cacheManager.del(this.getProductCacheKey(slug));
    }
  }

  async findBySlug(slug: string) {
    const cacheKey = this.getProductCacheKey(slug);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        brand: true,
        module: true,
        categories: { include: { category: true } },
        inventory: { include: { warehouse: true } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    const result = {
      ...product,
      price: product.price.toNumber(),
      compareAtPrice: product.compareAtPrice?.toNumber(),
      categories: product.categories.map((pc) => pc.category),
    };

    await this.cacheManager.set(cacheKey, result, 10 * 60 * 1000);
    return result;
  }

  async create(dto: CreateProductDto) {
    // Validate required fields
    if (!dto.name?.trim()) {
      throw new BadRequestException('Product name is required');
    }
    if (!dto.slug?.trim()) {
      throw new BadRequestException('Product slug is required');
    }
    if (!dto.description?.trim()) {
      throw new BadRequestException('Product description is required');
    }
    if (!dto.price || dto.price <= 0) {
      throw new BadRequestException('Product price must be greater than 0');
    }

    // Check for duplicate slug
    const existingBySlug = await this.prisma.product.findUnique({ where: { slug: dto.slug } });
    if (existingBySlug) {
      throw new BadRequestException('A product with this slug already exists');
    }

    if (!dto.sku) {
      dto.sku = await this.generateSKU(dto.brandId);
    }

    const existing = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
    if (existing) throw new BadRequestException('SKU already exists');

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        sku: dto.sku,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        costPrice: dto.costPrice,
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
        brandId: dto.brandId && dto.brandId.trim() ? dto.brandId : null,
        moduleId: dto.moduleId && dto.moduleId.trim() ? dto.moduleId : null,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        categories: dto.categoryIds
          ? {
              create: dto.categoryIds.map((catId) => ({
                category: { connect: { id: catId } },
              })),
            }
          : undefined,
      },
    });

    if (dto.warehouseId && dto.initialQuantity !== undefined) {
      await this.prisma.inventory.create({
        data: {
          productId: product.id,
          warehouseId: dto.warehouseId,
          quantity: dto.initialQuantity,
          lowStockThreshold: dto.lowStockThreshold ?? 5,
        },
      });
    }

    return this.findBySlug(product.slug);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    if (dto.sku && dto.sku !== product.sku) {
      const dup = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
      if (dup) throw new BadRequestException('SKU already exists');
    }

    const data: any = { ...dto };
    delete data.categoryIds;
    delete data.warehouseId;
    delete data.initialQuantity;
    delete data.lowStockThreshold;

    // Handle optional fields - convert empty strings to null
    if (data.brandId !== undefined) {
      data.brandId = data.brandId && data.brandId.trim() ? data.brandId : null;
    }
    if (data.moduleId !== undefined) {
      data.moduleId = data.moduleId && data.moduleId.trim() ? data.moduleId : null;
    }

    await this.prisma.product.update({ where: { id }, data });

    if (dto.categoryIds) {
      await this.prisma.productCategory.deleteMany({ where: { productId: id } });
      await this.prisma.productCategory.createMany({
        data: dto.categoryIds.map((catId) => ({
          productId: id,
          categoryId: catId,
        })),
      });
    }

    if (dto.warehouseId && dto.initialQuantity !== undefined) {
      await this.prisma.inventory.upsert({
        where: { productId_warehouseId: { productId: id, warehouseId: dto.warehouseId } },
        create: {
          productId: id,
          warehouseId: dto.warehouseId,
          quantity: dto.initialQuantity,
          lowStockThreshold: dto.lowStockThreshold ?? 5,
        },
        update: {
          quantity: dto.initialQuantity,
          lowStockThreshold: dto.lowStockThreshold ?? 5,
        },
      });
    }

    await this.clearProductCache(product.slug);
    if (dto.slug && dto.slug !== product.slug) {
      await this.clearProductCache(dto.slug);
    }

    const updatedProduct = await this.prisma.product.findUnique({ where: { id } });
    return this.findBySlug(updatedProduct!.slug);
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.prisma.product.delete({ where: { id } });
    await this.clearProductCache(product.slug);
    return { message: 'Product deleted' };
  }

  async uploadImages(productId: string, files: any[]) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploaded = [];
    for (const file of files) {
      try {
        if (!file.buffer) {
          throw new BadRequestException(`File ${file.originalname} has no buffer`);
        }
        
        const result = await this.cloudinary.uploadImage(file);
        const image = await this.prisma.productImage.create({
          data: {
            productId,
            url: result.secure_url,
            alt: file.originalname || 'Product image',
            sortOrder: 0,
            isPrimary: false,
          },
        });
        uploaded.push(image);
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        throw new BadRequestException(
          `Failed to upload ${file.originalname}: ${error.message}`,
        );
      }
    }
    await this.clearProductCache(product.slug);
    return uploaded;
  }

  async deleteImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({ 
      where: { id: imageId },
      include: { product: true },
    });
    if (!image) throw new NotFoundException('Image not found');
    await this.prisma.productImage.delete({ where: { id: imageId } });
    if (image.product) {
      await this.clearProductCache(image.product.slug);
    }
    return { message: 'Image deleted' };
  }
}