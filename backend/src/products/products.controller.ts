import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductDto } from './dto/query-product.dto';
import { CacheControl } from '../common/decorators/cache-control.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  @CacheControl('public, max-age=300, s-maxage=600')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
