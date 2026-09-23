import { ReviewsService } from './reviews.service';

// FIG-484/FIG-485: the public product page caches its detail payload
// (including reviews) for 10 minutes, keyed by slug. Review create/delete
// only had a productId, not the slug, so neither invalidated that cache --
// a new review or an admin deletion silently didn't show up on the storefront
// until the cache happened to expire. Both paths now call
// ProductsService.invalidateCacheForProductId after writing.
describe('ReviewsService — product cache invalidation', () => {
  function createService() {
    const review = {
      id: 'r1',
      userId: 'u1',
      productId: 'p1',
      rating: 5,
      title: 'Great',
      body: 'Nice product',
    };

    const prisma = {
      product: { findUnique: jest.fn().mockResolvedValue({ id: 'p1' }) },
      review: {
        // null: no existing review for the create()-path duplicate check.
        // The delete test overrides this to return `review` for its lookup.
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(review),
        delete: jest.fn().mockResolvedValue(review),
      },
    } as any;
    const auditService = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const productsService = {
      invalidateCacheForProductId: jest.fn().mockResolvedValue(undefined),
    } as any;

    return {
      service: new ReviewsService(prisma, auditService, productsService),
      productsService,
      prisma,
    };
  }

  it('invalidates the product cache after creating a review', async () => {
    const { service, productsService } = createService();

    await service.create('u1', {
      productId: 'p1',
      rating: 5,
      title: 'Great',
      body: 'Nice product',
    });

    expect(productsService.invalidateCacheForProductId).toHaveBeenCalledWith(
      'p1',
    );
  });

  it('invalidates the product cache after an admin deletes a review', async () => {
    const { service, productsService, prisma } = createService();
    prisma.review.findUnique.mockResolvedValue({
      id: 'r1',
      productId: 'p1',
      rating: 5,
      title: 'Great',
    });

    await service.deleteReview('r1', 'admin-1');

    expect(productsService.invalidateCacheForProductId).toHaveBeenCalledWith(
      'p1',
    );
  });
});
