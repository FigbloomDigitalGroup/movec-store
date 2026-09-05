import { CartService } from './cart.service';

describe('CartService.addItem', () => {
  function createService(product: any) {
    const cart = { id: 'cart-1', userId: 'u1' };
    const prisma = {
      product: { findUnique: jest.fn().mockResolvedValue(product) },
      cart: {
        findUnique: jest.fn().mockResolvedValue({ ...cart, items: [] }),
        create: jest.fn().mockResolvedValue(cart),
      },
      cartItem: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
    } as any;
    return { service: new CartService(prisma), prisma };
  }

  const activeInStockProduct = {
    id: 'p1',
    isActive: true,
    inventory: [{ quantity: 10 }],
  };

  it('rejects when the product does not exist', async () => {
    const { service } = createService(null);
    await expect(
      service.addItem('u1', { productId: 'missing', quantity: 1 }),
    ).rejects.toThrow('Product not found');
  });

  // This is the check that stops a deactivated (discontinued/recalled/hidden)
  // product from being added to a cart at all — confirmed earlier this session
  // to be the reason a hidden product can't actually be purchased end-to-end
  // even though its detail page was separately found to leak without this guard.
  it('rejects when the product exists but is not active', async () => {
    const { service } = createService({
      ...activeInStockProduct,
      isActive: false,
    });
    await expect(
      service.addItem('u1', { productId: 'p1', quantity: 1 }),
    ).rejects.toThrow('Product not found');
  });

  it('rejects when the requested quantity exceeds total stock across all warehouses', async () => {
    const { service } = createService({
      ...activeInStockProduct,
      inventory: [{ quantity: 3 }, { quantity: 2 }],
    });
    await expect(
      service.addItem('u1', { productId: 'p1', quantity: 6 }),
    ).rejects.toThrow('Insufficient stock');
  });

  it('creates a new cart item when the product is not already in the cart', async () => {
    const { service, prisma } = createService(activeInStockProduct);
    await service.addItem('u1', { productId: 'p1', quantity: 2 });

    expect(prisma.cartItem.create).toHaveBeenCalledWith({
      data: { cartId: 'cart-1', productId: 'p1', quantity: 2 },
    });
    expect(prisma.cartItem.update).not.toHaveBeenCalled();
  });

  it('merges quantity into the existing cart item instead of creating a duplicate row', async () => {
    const { service, prisma } = createService(activeInStockProduct);
    prisma.cartItem.findUnique.mockResolvedValue({ id: 'item-1', quantity: 3 });

    await service.addItem('u1', { productId: 'p1', quantity: 2 });

    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'item-1' },
      data: { quantity: 5 },
    });
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });
});
