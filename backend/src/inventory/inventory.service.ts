import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.inventory.findMany({
      include: { product: { select: { id: true, name: true, sku: true } }, warehouse: true },
    });
  }

  async findByProduct(productId: string) {
    const inventory = await this.prisma.inventory.findMany({
      where: { productId },
      include: { warehouse: true },
    });
    if (!inventory.length) throw new NotFoundException('No inventory found');
    return inventory;
  }

  async stockIn(dto: StockInDto) {
    const inventory = await this.prisma.inventory.upsert({
      where: {
        productId_warehouseId: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
        },
      },
      create: {
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        quantity: dto.quantity,
      },
      update: {
        quantity: { increment: dto.quantity },
      },
    });

    await this.prisma.inventoryHistory.create({
      data: {
        inventoryId: inventory.id,
        change: dto.quantity,
        reason: 'STOCK_IN',
        reference: dto.reference,
      },
    });

    return inventory;
  }

  async stockOut(dto: StockOutDto) {
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
        },
      },
    });

    if (!inventory) throw new NotFoundException('Inventory record not found');
    if (inventory.quantity < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const updated = await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: { quantity: { decrement: dto.quantity } },
    });

    await this.prisma.inventoryHistory.create({
      data: {
        inventoryId: inventory.id,
        change: -dto.quantity,
        reason: dto.reason,
        reference: dto.reference,
      },
    });

    return updated;
  }

  async getHistory(inventoryId?: string) {
    const where = inventoryId ? { inventoryId } : {};
    return this.prisma.inventoryHistory.findMany({
      where,
      include: { inventory: { include: { product: true, warehouse: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async lowStock() {
    return this.prisma.inventory.findMany({
      where: {
        quantity: { lte: this.prisma.inventory.fields.lowStockThreshold },
      },
      include: { product: true, warehouse: true },
    });
  }

  async fulfillOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return;

    for (const item of order.items) {
      const inventories = await this.prisma.inventory.findMany({
        where: { productId: item.productId },
        orderBy: { quantity: 'desc' },
      });

      if (!inventories.length) continue;

      let remainingQuantity = item.quantity;

      for (let i = 0; i < inventories.length; i++) {
        if (remainingQuantity <= 0) break;

        const inv = inventories[i];
        const isLast = i === inventories.length - 1;

        let deduct = 0;
        if (isLast) {
          deduct = remainingQuantity;
        } else if (inv.quantity > 0) {
          deduct = Math.min(inv.quantity, remainingQuantity);
        }

        if (deduct > 0) {
          await this.prisma.inventory.update({
            where: { id: inv.id },
            data: { quantity: { decrement: deduct } },
          });

          await this.prisma.inventoryHistory.create({
            data: {
              inventoryId: inv.id,
              change: -deduct,
              reason: 'SALE',
              reference: order.orderNumber,
            },
          });

          remainingQuantity -= deduct;
        }
      }
    }
  }
}