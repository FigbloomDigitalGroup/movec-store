import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';

type Tx = Prisma.TransactionClient;

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Atomically reserves stock for one order line at checkout time: moves `quantity`
   * requested out of the sellable `quantity` column and into `reservedQuantity`,
   * split across warehouses (largest first) exactly like fulfillOrder's allocation.
   * Must run inside the same $transaction as the rest of checkout — if this throws,
   * the whole checkout (and any reservations already made for earlier cart lines)
   * rolls back. The conditional `updateMany` (quantity gte deduct) is what makes two
   * concurrent checkouts for the last unit of the same product resolve safely: only
   * one of them can win the row at UPDATE time, the other sees count===0 and the
   * shortfall surfaces as a clean "insufficient stock" error instead of overselling.
   */
  async reserveStock(tx: Tx, productId: string, quantity: number): Promise<void> {
    const inventories = await tx.inventory.findMany({
      where: { productId },
      orderBy: { quantity: 'desc' },
    });

    let remaining = quantity;
    for (const inv of inventories) {
      if (remaining <= 0) break;
      const deduct = Math.min(inv.quantity, remaining);
      if (deduct <= 0) continue;

      const result = await tx.inventory.updateMany({
        where: { id: inv.id, quantity: { gte: deduct } },
        data: { quantity: { decrement: deduct }, reservedQuantity: { increment: deduct } },
      });
      if (result.count > 0) {
        remaining -= deduct;
      }
    }

    if (remaining > 0) {
      throw new BadRequestException(
        `Only ${quantity - remaining} unit(s) of this product are currently available.`,
      );
    }
  }

  /**
   * Called when an order is actually paid (from fulfillOrder): releases the hold
   * placed by reserveStock without touching `quantity` again — the physical stock
   * was already moved out of `quantity` at reservation time, so decrementing it a
   * second time here would double-count the sale.
   */
  private async consumeReservation(
    tx: Tx,
    productId: string,
    quantity: number,
    reference: string,
  ): Promise<void> {
    const reserved = await tx.inventory.findMany({
      where: { productId, reservedQuantity: { gt: 0 } },
      orderBy: { reservedQuantity: 'desc' },
    });

    let remaining = quantity;
    for (const inv of reserved) {
      if (remaining <= 0) break;
      const deduct = Math.min(inv.reservedQuantity, remaining);
      if (deduct <= 0) continue;

      const result = await tx.inventory.updateMany({
        where: { id: inv.id, reservedQuantity: { gte: deduct } },
        data: { reservedQuantity: { decrement: deduct } },
      });
      if (result.count > 0) {
        remaining -= deduct;
        await tx.inventoryHistory.create({
          data: { inventoryId: inv.id, change: -deduct, reason: 'SALE', reference },
        });
      }
    }

    // Orders placed before this reservation system shipped never reserved anything,
    // so `remaining` will still be > 0 for them here. Fall back to a direct,
    // stock-safe decrement so fulfillment doesn't silently no-op for those orders
    // during the transition — this branch is a no-op once no such orders remain.
    if (remaining > 0) {
      const fallback = await tx.inventory.findMany({
        where: { productId },
        orderBy: { quantity: 'desc' },
      });
      for (const inv of fallback) {
        if (remaining <= 0) break;
        const deduct = Math.min(inv.quantity, remaining);
        if (deduct <= 0) continue;
        const result = await tx.inventory.updateMany({
          where: { id: inv.id, quantity: { gte: deduct } },
          data: { quantity: { decrement: deduct } },
        });
        if (result.count > 0) {
          remaining -= deduct;
          await tx.inventoryHistory.create({
            data: { inventoryId: inv.id, change: -deduct, reason: 'SALE', reference },
          });
        }
      }
    }
  }

  /** Releases a reservation for an order that's cancelled before it was ever fulfilled. */
  private async releaseReservation(
    tx: Tx,
    productId: string,
    quantity: number,
    reference: string,
  ): Promise<void> {
    const reserved = await tx.inventory.findMany({
      where: { productId, reservedQuantity: { gt: 0 } },
      orderBy: { reservedQuantity: 'desc' },
    });

    let remaining = quantity;
    for (const inv of reserved) {
      if (remaining <= 0) break;
      const give = Math.min(inv.reservedQuantity, remaining);
      if (give <= 0) continue;
      await tx.inventory.update({
        where: { id: inv.id },
        data: { quantity: { increment: give }, reservedQuantity: { decrement: give } },
      });
      await tx.inventoryHistory.create({
        data: { inventoryId: inv.id, change: give, reason: 'CANCELLED', reference },
      });
      remaining -= give;
    }
  }

  /** Restocks a previously-fulfilled (already sold) line — used when a CONFIRMED order is cancelled. */
  private async restock(tx: Tx, productId: string, quantity: number, reference: string): Promise<void> {
    const inv = await tx.inventory.findFirst({ where: { productId }, orderBy: { quantity: 'desc' } });
    if (!inv) return;
    await tx.inventory.update({
      where: { id: inv.id },
      data: { quantity: { increment: quantity } },
    });
    await tx.inventoryHistory.create({
      data: { inventoryId: inv.id, change: quantity, reason: 'RETURN', reference },
    });
  }

  /** Public entry point used by OrdersService.cancelOrder to reverse the right thing. */
  async returnOrderStock(
    tx: Tx,
    items: { productId: string; quantity: number }[],
    orderNumber: string,
    wasFulfilled: boolean,
  ): Promise<void> {
    for (const item of items) {
      if (wasFulfilled) {
        await this.restock(tx, item.productId, item.quantity, orderNumber);
      } else {
        await this.releaseReservation(tx, item.productId, item.quantity, orderNumber);
      }
    }
  }

  async findAll() {
    return this.prisma.inventory.findMany({
      include: { product: { select: { id: true, name: true, sku: true } }, warehouse: true },
    });
  }

  async findWarehouses() {
    return this.prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
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

    // Conditional update instead of read-then-write: the WHERE clause is re-checked
    // against the row's live value at UPDATE time, so two concurrent stock-out calls
    // for the same row can't both succeed off the same stale read and take it negative.
    const result = await this.prisma.inventory.updateMany({
      where: { id: inventory.id, quantity: { gte: dto.quantity } },
      data: { quantity: { decrement: dto.quantity } },
    });

    if (result.count === 0) {
      throw new BadRequestException('Insufficient stock');
    }

    await this.prisma.inventoryHistory.create({
      data: {
        inventoryId: inventory.id,
        change: -dto.quantity,
        reason: dto.reason,
        reference: dto.reference,
      },
    });

    return this.prisma.inventory.findUniqueOrThrow({ where: { id: inventory.id } });
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

    // All line items are consumed inside one transaction so a failure partway
    // through can't leave some lines fulfilled and others not.
    await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await this.consumeReservation(tx, item.productId, item.quantity, order.orderNumber);
      }
    });
  }
}