import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.reportsService.getDashboardSummary();
  }

  @Get('sales')
  getSales(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getSalesReport(from, to);
  }

  @Get('inventory')
  getInventory() {
    return this.reportsService.getInventoryReport();
  }

  @Get('customers')
  getCustomers() {
    return this.reportsService.getCustomersReport();
  }

  @Get('products')
  getProducts() {
    return this.reportsService.getProductsReport();
  }

  @Get('installations')
  getInstallations() {
    return this.reportsService.getInstallationsReport();
  }
}