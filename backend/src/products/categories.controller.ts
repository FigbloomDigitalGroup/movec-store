import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CacheControl } from '../common/decorators/cache-control.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @CacheControl('public, max-age=300, s-maxage=600')
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }
}