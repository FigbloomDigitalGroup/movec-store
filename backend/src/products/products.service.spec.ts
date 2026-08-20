import { ProductsService } from './products.service';

describe('ProductsService.findBySlug', () => {
  function createService(product: any) {
    const prisma = {
      product: { findFirst: jest.fn().mockResolvedValue(product) },
    } as any;
    const cloudinary = {} as any;
    const cacheManager = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn(),
    };
    const service = new ProductsService(prisma, cloudinary, cacheManager);
    return { service, prisma };
  }

  const fakeProduct = {
    id: 'p1',
    slug: 'starlink-kit',
    price: { toNumber: () => 1000 },
    compareAtPrice: null,
    categories: [],
    reviews: [],
  };

  it('only returns a product that is active — a hidden/discontinued product must not be fetchable by slug', async () => {
    const { service, prisma } = createService(fakeProduct);
    await service.findBySlug('starlink-kit');

    expect(prisma.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'starlink-kit', isActive: true },
      }),
    );
  });

  it('throws NotFoundException when no active product matches the slug', async () => {
    const { service } = createService(null);
    await expect(service.findBySlug('missing')).rejects.toThrow(
      'Product not found',
    );
  });
});
