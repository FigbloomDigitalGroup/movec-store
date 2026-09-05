import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
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
  getCustomers(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getCustomersReport(from, to);
  }

  @Get('products')
  getProducts(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getProductsReport(from, to);
  }

  @Get('installations')
  getInstallations(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getInstallationsReport(from, to);
  }

  @Get('export')
  async exportReport(
    @Query('type') type: string,
    @Query('format') format: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const { title, rows } = await this.reportsService.getExportData(
      type,
      from,
      to,
    );

    if (format === 'csv') {
      const csv = this.reportsService.buildCsv(rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${type}-report.csv`,
      );
      return res.send(csv);
    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${type}-report.pdf`,
      );
      this.reportsService.buildPdf(title, rows, res);
    } else {
      res.status(400).send('Invalid format');
    }
  }
}
