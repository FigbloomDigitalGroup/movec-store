import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

    const orders = await this.prisma.order.findMany({
      where,
      include: { items: true, payments: true },
    });

    const totalSales = orders.reduce((sum, o) => sum + o.total.toNumber(), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const paymentMethods = orders.reduce((acc: any, o) => {
      const method = o.payments[0]?.method || 'UNKNOWN';
      acc[method] = (acc[method] || 0) + 1;
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

  async getCustomersReport() {
    const totalCustomers = await this.prisma.user.count({
      where: { userRoles: { some: { role: { name: 'CUSTOMER' } } } },
    });

    const newToday = await this.prisma.user.count({
      where: {
        userRoles: { some: { role: { name: 'CUSTOMER' } } },
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    const topCustomers = await this.prisma.order.groupBy({
      by: ['userId'],
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10,
    });

    const withNames = await Promise.all(
      topCustomers.map(async (c) => {
        const user = await this.prisma.user.findUnique({
          where: { id: c.userId },
          select: { firstName: true, lastName: true, email: true },
        });
        return {
          ...user,
          totalSpent: c._sum.total?.toNumber() || 0,
          ordersCount: c._count.id,
        };
      }),
    );

    return {
      totalCustomers,
      newToday,
      topCustomers: withNames,
    };
  }

  async getProductsReport() {
    const totalProducts = await this.prisma.product.count({ where: { isActive: true } });

    const topSelling = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const withNames = await Promise.all(
      topSelling.map(async (p) => {
        const product = await this.prisma.product.findUnique({
          where: { id: p.productId },
          select: { name: true, slug: true, price: true },
        });
        return {
          ...product,
          price: product?.price.toNumber(),
          totalSold: p._sum.quantity || 0,
          revenue: (product?.price.toNumber() || 0) * (p._sum.quantity || 0),
        };
      }),
    );

    return {
      totalProducts,
      topSelling: withNames,
    };
  }

  async getInstallationsReport() {
    const total = await this.prisma.installationRequest.count();
    const byStatus = await this.prisma.installationRequest.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const revenue = await this.prisma.installationRequest.aggregate({
      _sum: { finalPrice: true },
      where: { status: 'COMPLETED' },
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
        total: products.totalProducts,
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
}