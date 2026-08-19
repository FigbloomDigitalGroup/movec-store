import { CheckoutService } from './checkout.service';

describe('CheckoutService.checkout', () => {
  const decimal = (n: number) => ({ toNumber: () => n });

  function createService(opts: { cart?: any; coupon?: any } = {}) {
    const cart = opts.cart ?? {
      items: [
        {
          productId: 'p1',
          quantity: 1,
          name: 'Widget',
          sku: 'SKU1',
          price: 1000,
        },
      ],
      total: 1000,
    };
    const cartService = {
      getCart: jest.fn().mockResolvedValue(cart),
      clearCart: jest.fn().mockResolvedValue(undefined),
    } as any;
    const inventoryService = {
      reserveStock: jest.fn().mockResolvedValue(undefined),
    } as any;

    const tx = {
      coupon: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      order: {
        create: jest.fn().mockImplementation(({ data }: any) =>
          Promise.resolve({
            ...data,
            id: 'order-1',
            createdAt: new Date('2026-01-01'),
            items: [],
            shippingAddress: { id: 'ship-1' },
            billingAddress: { id: 'bill-1' },
          }),
        ),
      },
    };

    const prisma = {
      address: {
        findFirst: jest
          .fn()
          .mockImplementation(({ where }: any) =>
            Promise.resolve(where.id === 'missing' ? null : { id: where.id }),
          ),
      },
      coupon: { findUnique: jest.fn().mockResolvedValue(opts.coupon ?? null) },
      $transaction: jest.fn().mockImplementation((cb: any) => cb(tx)),
    } as any;

    return {
      service: new CheckoutService(prisma, cartService, inventoryService),
      prisma,
      tx,
      inventoryService,
    };
  }

  const baseDto = { shippingAddressId: 'ship-1', billingAddressId: 'bill-1' };

  it('rejects an empty cart before touching addresses or payment', async () => {
    const { service } = createService({ cart: { items: [], total: 0 } });
    await expect(service.checkout('u1', baseDto)).rejects.toThrow(
      'Cart is empty',
    );
  });

  it('rejects when the shipping address does not belong to this user', async () => {
    const { service } = createService();
    await expect(
      service.checkout('u1', {
        ...baseDto,
        shippingAddressId: 'missing',
      }),
    ).rejects.toThrow('Shipping address not found');
  });

  it('rejects when the billing address does not belong to this user', async () => {
    const { service } = createService();
    await expect(
      service.checkout('u1', {
        ...baseDto,
        billingAddressId: 'missing',
      }),
    ).rejects.toThrow('Billing address not found');
  });

  describe('coupon validation', () => {
    const activeCoupon = {
      id: 'c1',
      isActive: true,
      expiresAt: null,
      startsAt: null,
      maxUsage: null,
      usedCount: 0,
      minOrderAmount: null,
      discountType: 'FIXED',
      discountValue: decimal(100),
    };

    it('rejects an unknown or inactive coupon code', async () => {
      const { service } = createService({
        coupon: { ...activeCoupon, isActive: false },
      });
      await expect(
        service.checkout('u1', { ...baseDto, couponCode: 'SAVE10' }),
      ).rejects.toThrow('Invalid coupon code');
    });

    it('rejects an expired coupon', async () => {
      const { service } = createService({
        coupon: { ...activeCoupon, expiresAt: new Date('2020-01-01') },
      });
      await expect(
        service.checkout('u1', { ...baseDto, couponCode: 'SAVE10' }),
      ).rejects.toThrow('Coupon has expired');
    });

    it('rejects a coupon that has not started yet', async () => {
      const { service } = createService({
        coupon: { ...activeCoupon, startsAt: new Date('2099-01-01') },
      });
      await expect(
        service.checkout('u1', { ...baseDto, couponCode: 'SAVE10' }),
      ).rejects.toThrow('Coupon is not yet active');
    });

    it('rejects a coupon that has hit its usage limit', async () => {
      const { service } = createService({
        coupon: { ...activeCoupon, maxUsage: 5, usedCount: 5 },
      });
      await expect(
        service.checkout('u1', { ...baseDto, couponCode: 'SAVE10' }),
      ).rejects.toThrow('Coupon usage limit reached');
    });

    it('rejects when the cart subtotal is below the coupon minimum', async () => {
      const { service } = createService({
        coupon: { ...activeCoupon, minOrderAmount: decimal(5000) },
      });
      await expect(
        service.checkout('u1', { ...baseDto, couponCode: 'SAVE10' }),
      ).rejects.toThrow('Minimum order amount of 5000 required');
    });

    it('computes a percentage discount off the subtotal', async () => {
      const { service, tx } = createService({
        coupon: {
          ...activeCoupon,
          discountType: 'PERCENTAGE',
          discountValue: decimal(10),
        },
      });
      await service.checkout('u1', { ...baseDto, couponCode: 'SAVE10' });

      // subtotal 1000, 10% = 100 discount, shipping 500 (below 20000 free threshold),
      // tax 16% of subtotal (160) — discount does not reduce the taxable subtotal.
      expect(tx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 1000,
            discountAmount: 100,
            shippingCost: 500,
            taxAmount: 160,
            total: 1000 - 100 + 500 + 160,
          }),
        }),
      );
    });

    it('caps a fixed discount at the subtotal so total never goes negative from the discount alone', async () => {
      const { service, tx } = createService({
        coupon: {
          ...activeCoupon,
          discountType: 'FIXED',
          discountValue: decimal(5000),
        },
      });
      await service.checkout('u1', { ...baseDto, couponCode: 'BIG' });

      expect(tx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ discountAmount: 1000 }),
        }),
      );
    });

    it('re-checks and atomically increments usage inside the transaction, and fails the whole checkout if that loses a race', async () => {
      const { service, tx } = createService({ coupon: activeCoupon });
      tx.coupon.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.checkout('u1', { ...baseDto, couponCode: 'SAVE10' }),
      ).rejects.toThrow('Coupon usage limit reached');
      expect(tx.order.create).not.toHaveBeenCalled();
    });
  });

  describe('shipping and tax', () => {
    it('charges shipping below the free-shipping threshold', async () => {
      const { service, tx } = createService({
        cart: {
          items: [
            {
              productId: 'p1',
              quantity: 1,
              name: 'Widget',
              sku: 'SKU1',
              price: 1000,
            },
          ],
          total: 1000,
        },
      });
      await service.checkout('u1', baseDto);
      expect(tx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ shippingCost: 500 }),
        }),
      );
    });

    it('waives shipping at or above the free-shipping threshold', async () => {
      const { service, tx } = createService({
        cart: {
          items: [
            {
              productId: 'p1',
              quantity: 1,
              name: 'Widget',
              sku: 'SKU1',
              price: 20000,
            },
          ],
          total: 20000,
        },
      });
      await service.checkout('u1', baseDto);
      expect(tx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ shippingCost: 0 }),
        }),
      );
    });
  });

  it('reserves stock for every cart line inside the transaction before creating the order', async () => {
    const { service, inventoryService } = createService({
      cart: {
        items: [
          {
            productId: 'p1',
            quantity: 2,
            name: 'Widget',
            sku: 'SKU1',
            price: 500,
          },
          {
            productId: 'p2',
            quantity: 1,
            name: 'Gadget',
            sku: 'SKU2',
            price: 500,
          },
        ],
        total: 1500,
      },
    });
    await service.checkout('u1', baseDto);

    expect(inventoryService.reserveStock).toHaveBeenCalledTimes(2);
    expect(inventoryService.reserveStock).toHaveBeenCalledWith(
      expect.anything(),
      'p1',
      2,
    );
    expect(inventoryService.reserveStock).toHaveBeenCalledWith(
      expect.anything(),
      'p2',
      1,
    );
  });
});
