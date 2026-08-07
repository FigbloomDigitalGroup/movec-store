import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

@Controller('admin/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('warehouses')
  findWarehouses() {
    return this.inventoryService.findWarehouses();
  }

  @Get('low-stock')
  lowStock() {
    return this.inventoryService.lowStock();
  }

  @Get('history')
  getHistory(@Query('inventoryId') inventoryId?: string) {
    return this.inventoryService.getHistory(inventoryId);
  }

  @Get(':productId')
  findByProduct(@Param('productId') productId: string) {
    return this.inventoryService.findByProduct(productId);
  }

  @Post('stock-in')
  stockIn(@Body() dto: StockInDto) {
    return this.inventoryService.stockIn(dto);
  }

  @Post('stock-out')
  stockOut(@Body() dto: StockOutDto) {
    return this.inventoryService.stockOut(dto);
  }
}