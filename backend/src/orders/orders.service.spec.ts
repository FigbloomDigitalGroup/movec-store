import { OrdersService } from './orders.service';

describe('OrdersService.updateStatus — CANCELLED/REFUNDED reconciliation', () => {
  // Regression test for the admin status-change endpoint silently leaving
  // inventory decremented and completed payments untouched when an admin
  // cancels/refunds an order through the generic status endpoint instead of
  // the customer-facing cancelOrder() flow. Mirrors how checkout.service.spec.ts
  // mocks $transaction: the callback runs immediately against a stub `tx`.
  function createService(orderStatus: string) {
    const order = {
      id: 'order-1',
      orderNumber: 'ORD-1',
      status: orderStatus,
      items: [{ productId: 'p1', quantity: 2 }],
    };

    const tx = {
      order: { update: jest.fn().mockResolvedValue(undefined) },
      payment: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };

    const prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue(order),
        update: jest.fn().mockResolvedValue(undefined),
      },
      shipping: {
        upsert: jest.fn().mockResolvedValue(undefined),
      },
      $transaction: jest.fn().mockImplementation((cb: any) => cb(tx)),
    } as any;

    const inventoryService = {
      returnOrderStock: jest.fn().mockResolvedValue(undefined),
    } as any;
    const auditService = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const notificationsService = { notifyAdmins: jest.fn() } as any;

    return {
      service: new OrdersService(
        prisma,
        inventoryService,
        auditService,
        notificationsService,
      ),
      tx,
      inventoryService,
    };
  }

  it('restocks (rather than releases) and refunds the completed payment when cancelling an already-fulfilled order', async () => {
    const { service, tx, inventoryService } = createService('CONFIRMED');

    await service.updateStatus('order-1', 'CANCELLED');

    expect(inventoryService.returnOrderStock).toHaveBeenCalledWith(
      tx,
      [{ productId: 'p1', quantity: 2 }],
      'ORD-1',
      true, // wasFulfilled — CONFIRMED had already run fulfillOrder()
    );
    expect(tx.payment.updateMany).toHaveBeenCalledWith({
      where: { orderId: 'order-1', status: 'COMPLETED' },
      data: { status: 'REFUNDED' },
    });
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: {
        status: 'CANCELLED',
        statusHistory: { create: { status: 'CANCELLED', changedBy: 'admin' } },
      },
    });
  });

  it('releases the reservation instead of restocking when the order never left PENDING', async () => {
    const { service, inventoryService } = createService('PENDING');

    await service.updateStatus('order-1', 'CANCELLED');

    expect(inventoryService.returnOrderStock).toHaveBeenCalledWith(
      expect.anything(),
      [{ productId: 'p1', quantity: 2 }],
      'ORD-1',
      false, // wasFulfilled — PENDING only ever reserved stock
    );
  });

  it('does not touch inventory or payments for a non-terminal status change like SHIPPED', async () => {
    const { service, inventoryService, tx } = createService('CONFIRMED');

    await service.updateStatus('order-1', 'SHIPPED');

    expect(inventoryService.returnOrderStock).not.toHaveBeenCalled();
    expect(tx.payment.updateMany).not.toHaveBeenCalled();
  });
});
