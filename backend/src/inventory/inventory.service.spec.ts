import { InventoryService } from './inventory.service';

describe('InventoryService.reserveStock', () => {
  function createTx(inventories: any[], updateManyImpl?: (args: any) => any) {
    const updateMany = jest.fn(
      updateManyImpl ??
        ((args: any) => {
          const inv = inventories.find((i) => i.id === args.where.id);
          const ok = inv && inv.quantity >= args.where.quantity.gte;
          if (ok) inv.quantity -= args.data.quantity.decrement;
          return Promise.resolve({ count: ok ? 1 : 0 });
        }),
    );
    const tx = {
      inventory: {
        findMany: jest.fn().mockResolvedValue(inventories),
        updateMany,
      },
    } as any;
    return { tx, updateMany };
  }

  const service = new InventoryService({} as any);

  it('reserves entirely from a single warehouse when it has enough stock', async () => {
    const { tx, updateMany } = createTx([
      { id: 'w1', quantity: 20, reservedQuantity: 0 },
      { id: 'w2', quantity: 5, reservedQuantity: 0 },
    ]);

    await service.reserveStock(tx, 'p1', 10);

    expect(updateMany).toHaveBeenCalledTimes(1);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'w1', quantity: { gte: 10 } },
      data: {
        quantity: { decrement: 10 },
        reservedQuantity: { increment: 10 },
      },
    });
  });

  it('splits the reservation across warehouses (largest first) when no single one covers it', async () => {
    // findMany is already ordered desc by quantity in the real query — the mock
    // returns them pre-sorted the same way the service expects.
    const { tx, updateMany } = createTx([
      { id: 'w1', quantity: 6, reservedQuantity: 0 },
      { id: 'w2', quantity: 5, reservedQuantity: 0 },
    ]);

    await service.reserveStock(tx, 'p1', 10);

    expect(updateMany).toHaveBeenCalledTimes(2);
    expect(updateMany).toHaveBeenNthCalledWith(1, {
      where: { id: 'w1', quantity: { gte: 6 } },
      data: { quantity: { decrement: 6 }, reservedQuantity: { increment: 6 } },
    });
    expect(updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: 'w2', quantity: { gte: 4 } },
      data: { quantity: { decrement: 4 }, reservedQuantity: { increment: 4 } },
    });
  });

  it('throws with the actually-available count when total stock across all warehouses is insufficient', async () => {
    const { tx } = createTx([
      { id: 'w1', quantity: 3, reservedQuantity: 0 },
      { id: 'w2', quantity: 2, reservedQuantity: 0 },
    ]);

    await expect(service.reserveStock(tx, 'p1', 10)).rejects.toThrow(
      'Only 5 unit(s) of this product are currently available.',
    );
  });

  it('moves on to the next warehouse when a row loses a concurrent race (updateMany count 0)', async () => {
    // Simulates another transaction winning the row between findMany and updateMany —
    // the exact scenario the conditional `quantity: { gte: deduct }` guard exists for.
    const inventories = [
      { id: 'w1', quantity: 10, reservedQuantity: 0 },
      { id: 'w2', quantity: 10, reservedQuantity: 0 },
    ];
    const { tx, updateMany } = createTx(inventories, (args: any) => {
      if (args.where.id === 'w1') return Promise.resolve({ count: 0 }); // lost the race
      return Promise.resolve({ count: 1 });
    });

    await service.reserveStock(tx, 'p1', 10);

    expect(updateMany).toHaveBeenCalledTimes(2);
    expect(updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: 'w2', quantity: { gte: 10 } },
      data: {
        quantity: { decrement: 10 },
        reservedQuantity: { increment: 10 },
      },
    });
  });
});
