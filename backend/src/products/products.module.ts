import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CategoriesService } from './categories.service';
import { BrandsService } from './brands.service';
import { ProductsController } from './products.controller';
import { AdminProductsController } from './admin-products.controller';
import { CategoriesController } from './categories.controller';
import { AdminCategoriesController } from './admin-categories.controller';
import { BrandsController } from './brands.controller';
import { AdminBrandsController } from './admin-brands.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [
    ProductsController,
    AdminProductsController,
    CategoriesController,
    AdminCategoriesController,
    BrandsController,
    AdminBrandsController,
  ],
  providers: [ProductsService, CategoriesService, BrandsService],
  exports: [ProductsService],
})
export class ProductsModule {}
