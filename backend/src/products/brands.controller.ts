import { Controller, Get, Param } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CacheControl } from '../common/decorators/cache-control.decorator';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @CacheControl('public, max-age=300, s-maxage=600')
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }
}
