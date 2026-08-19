import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument = require('pdfkit');
import { Response } from 'express';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesReport(from?: string, to?: string) {
    const where: any = {
      status: { not: 'CANCELLED' },
    };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    // Aggregates computed in the database instead of pulling every matching order
    // (plus all of its items and payments) into Node memory just to sum a few fields
    // — this used to be the query the admin dashboard ran on every single load.
    const [totals, paymentGroups] = await Promise.all([
      this.prisma.order.aggregate({
        where,
        _sum: { total: true },
        _count: { _all: true },
      }),
      this.prisma.payment.groupBy({
        by: ['method'],
        where: { status: 'COMPLETED', order: where },
        _count: { _all: true },
      }),
    ]);

    const totalSales = totals._sum.total?.toNumber() ?? 0;
    const totalOrders = totals._count._all;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const paymentMethods = paymentGroups.reduce((acc: any, g) => {
      acc[g.method] = g._count._all;
      return acc;
    }, {});

    return {
      totalSales,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      paymentMethods,
      period: { from, to },
    };
  }

  async getInventoryReport() {
    const inventory = await this.prisma.inventory.findMany({
      include: { product: { select: { name: true, sku: true } }, warehouse: true },
      orderBy: { quantity: 'asc' },
    });

    const totalProducts = inventory.length;
    const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
    const lowStock = inventory.filter((i) => i.quantity <= i.lowStockThreshold);

    return {
      totalProducts,
      totalStock,
      lowStockCount: lowStock.length,
      lowStockItems: lowStock.map((i) => ({
        product: i.product.name,
        sku: i.product.sku,
        quantity: i.quantity,
        threshold: i.lowStockThreshold,
        warehouse: i.warehouse.name,
      })),
    };
  }

  async getCustomersReport(from?: string, to?: string) {
    const where: any = { userRoles: { some: { role: { name: 'CUSTOMER' } } } };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const totalCustomers = await this.prisma.user.count({ where });

    const newToday = await this.prisma.user.count({
      where: {
        ...where,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    const orderWhere: any = {};
    if (from || to) {
      orderWhere.createdAt = {};
      if (from) orderWhere.createdAt.gte = new Date(from);
      if (to) orderWhere.createdAt.lte = new Date(to);
    }

    const topCustomers = await this.prisma.order.groupBy({
      by: ['userId'],
      where: orderWhere,
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10,
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: topCustomers.map((c) => c.userId) } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const usersById = new Map(users.map((u) => [u.id, u]));

    const withNames = topCustomers.map((c) => {
      const user = usersById.get(c.userId);
      return {
        ...user,
        totalSpent: c._sum.total?.toNumber() || 0,
        ordersCount: c._count.id,
      };
    });

    return {
      totalCustomers,
      newToday,
      topCustomers: withNames,
    };
  }

  async getProductsReport(from?: string, to?: string) {
    const totalProducts = await this.prisma.product.count({ where: { isActive: true } });

    const orderItemWhere: any = {};
    if (from || to) {
      orderItemWhere.order = { createdAt: {} };
      if (from) orderItemWhere.order.createdAt.gte = new Date(from);
      if (to) orderItemWhere.order.createdAt.lte = new Date(to);
    }

    const topSelling = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: orderItemWhere,
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const products = await this.prisma.product.findMany({
      where: { id: { in: topSelling.map((p) => p.productId) } },
      select: { id: true, name: true, slug: true, price: true },
    });
    const productsById = new Map(products.map((p) => [p.id, p]));

    const withNames = topSelling.map((p) => {
      const product = productsById.get(p.productId);
      return {
        ...product,
        price: product?.price.toNumber(),
        totalSold: p._sum.quantity || 0,
        revenue: (product?.price.toNumber() || 0) * (p._sum.quantity || 0),
      };
    });

    return {
      totalProducts,
      topSelling: withNames,
    };
  }

  async getInstallationsReport(from?: string, to?: string) {
    const where: any = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const total = await this.prisma.installationRequest.count({ where });
    const byStatus = await this.prisma.installationRequest.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    });

    const revenue = await this.prisma.installationRequest.aggregate({
      _sum: { finalPrice: true },
      where: { ...where, status: 'COMPLETED' },
    });

    return {
      totalRequests: total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      totalRevenue: revenue._sum.finalPrice?.toNumber() || 0,
    };
  }

  async getDashboardSummary() {
    const [sales, inventory, customers, products, installations] = await Promise.all([
      this.getSalesReport(),
      this.getInventoryReport(),
      this.getCustomersReport(),
      this.getProductsReport(),
      this.getInstallationsReport(),
    ]);

    const pendingOrders = await this.prisma.order.count({
      where: { status: { in: ['PENDING', 'CONFIRMED'] } },
    });

    const pendingInstallations = await this.prisma.installationRequest.count({
      where: { status: 'PENDING' },
    });

    // Get total products count (active and inactive)
    const totalProducts = await this.prisma.product.count();
    const inStockProducts = await this.prisma.product.count({
      where: {
        inventory: {
          some: {
            quantity: { gt: 0 }
          }
        }
      }
    });
    const outOfStockProducts = totalProducts - inStockProducts;

    // Get total categories count
    const totalCategories = await this.prisma.category.count();

    return {
      sales: {
        total: sales.totalSales,
        orders: sales.totalOrders,
        averageOrder: sales.averageOrderValue,
      },
      inventory: {
        totalStock: inventory.totalStock,
        lowStock: inventory.lowStockCount,
      },
      customers: {
        total: customers.totalCustomers,
        newToday: customers.newToday,
      },
      products: {
        total: totalProducts,
        inStock: inStockProducts,
        outOfStock: outOfStockProducts,
      },
      categories: {
        total: totalCategories,
      },
      pending: {
        orders: pendingOrders,
        installations: pendingInstallations,
      },
      installations: {
        total: installations.totalRequests,
        revenue: installations.totalRevenue,
      },
    };
  }

  async getExportData(type: string, from?: string, to?: string) {
    let rawData: any;
    let exportRows: any[] = [];
    let title = '';

    switch (type) {
      case 'sales':
        rawData = await this.getSalesReport(from, to);
        title = 'Sales Report';
        exportRows = [
          { Metric: 'Total Sales', Value: rawData.totalSales },
          { Metric: 'Total Orders', Value: rawData.totalOrders },
          { Metric: 'Average Order Value', Value: rawData.averageOrderValue },
          ...Object.entries(rawData.paymentMethods).map(([method, count]) => ({
            Metric: `Orders via ${method}`, Value: count
          }))
        ];
        break;
      case 'inventory':
        rawData = await this.getInventoryReport();
        title = 'Inventory Report';
        exportRows = rawData.lowStockItems.map((item: any) => ({
          Product: item.product,
          SKU: item.sku,
          Quantity: item.quantity,
          Threshold: item.threshold,
          Warehouse: item.warehouse,
        }));
        // If no low stock, provide general stats
        if (exportRows.length === 0) {
           exportRows = [
             { Metric: 'Total Products', Value: rawData.totalProducts },
             { Metric: 'Total Stock', Value: rawData.totalStock },
             { Metric: 'Low Stock Count', Value: 0 }
           ];
        }
        break;
      case 'customers':
        rawData = await this.getCustomersReport(from, to);
        title = 'Customers Report';
        exportRows = rawData.topCustomers.map((c: any) => ({
          Name: `${c.firstName} ${c.lastName}`,
          Email: c.email,
          Orders: c.ordersCount,
          TotalSpent: c.totalSpent,
        }));
        if (exportRows.length === 0) {
          exportRows = [
            { Metric: 'Total Customers', Value: rawData.totalCustomers },
            { Metric: 'New Today', Value: rawData.newToday }
          ];
        }
        break;
      case 'products':
        rawData = await this.getProductsReport(from, to);
        title = 'Top Products Report';
        exportRows = rawData.topSelling.map((p: any) => ({
          Product: p.name,
          Price: p.price,
          TotalSold: p.totalSold,
          Revenue: p.revenue,
        }));
        break;
      case 'installations':
        rawData = await this.getInstallationsReport(from, to);
        title = 'Installations Report';
        exportRows = [
          { Metric: 'Total Requests', Value: rawData.totalRequests },
          { Metric: 'Total Revenue', Value: rawData.totalRevenue },
          ...rawData.byStatus.map((s: any) => ({
            Metric: `Status: ${s.status}`, Value: s.count
          }))
        ];
        break;
      default:
        throw new Error('Invalid report type');
    }

    return { title, rows: exportRows };
  }

  buildCsv(data: any[]): string {
    if (!data || !data.length) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '""';
        let str = String(val);
        // Neutralize formula/DDE injection: a cell starting with =, +, -, or @ can
        // execute as a formula when the CSV is opened in Excel/Sheets — this data
        // includes user-supplied names (e.g. customer firstName/lastName), so a
        // customer could otherwise plant a payload an admin later opens.
        if (/^[=+\-@]/.test(str)) {
          str = `'${str}`;
        }
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  buildPdf(title: string, data: any[], res: Response) {
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown(2);

    if (data.length === 0) {
      doc.fontSize(12).text('No data available for this report period.', { align: 'center' });
    } else {
      doc.fontSize(10);
      data.forEach((row, index) => {
        const text = Object.entries(row)
          .map(([k, v]) => `${k}: ${v}`)
          .join('  |  ');
        doc.text(text);
        if (index < data.length - 1) doc.moveDown(0.5);
      });
    }

    doc.end();
  }
}