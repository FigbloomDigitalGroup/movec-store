import { Controller, Get, Param, Query } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CacheControl } from '../common/decorators/cache-control.decorator';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  /** GET /modules — list all active store modules */
  @Get()
  @CacheControl('public, max-age=300, s-maxage=600')
  findAll() {
    return this.modulesService.findAll();
  }

  /** GET /modules/:slug — get one module with its categories */
  @Get(':slug')
  @CacheControl('public, max-age=300, s-maxage=600')
  findOne(@Param('slug') slug: string) {
    return this.modulesService.findOne(slug);
  }

  /** GET /modules/:slug/products — products scoped to a module */
  @Get(':slug/products')
  findProducts(@Param('slug') slug: string, @Query() query: any) {
    return this.modulesService.findProducts(slug, query);
  }
}
