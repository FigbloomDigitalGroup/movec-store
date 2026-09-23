import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductDto } from './dto/query-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  // No @CacheControl here: this response embeds stock, price, and reviews,
  // all of which ProductsService already caches server-side for 10 minutes
  // via CACHE_MANAGER (a cache that's correctly invalidated on every write --
  // see invalidateCacheForProductId). A public/s-maxage HTTP header on top of
  // that meant a browser or CDN could keep serving a pre-invalidation copy
  // for up to 5-10 more minutes regardless of what the server-side cache was
  // doing, defeating that invalidation entirely for real visitors.
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
