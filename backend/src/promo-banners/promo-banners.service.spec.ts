import { PromoBannersService } from './promo-banners.service';

describe('PromoBannersService.findOne', () => {
  function createService(banner: any) {
    const prisma = {
      promoBanner: { findFirst: jest.fn().mockResolvedValue(banner) },
    } as any;
    return { service: new PromoBannersService(prisma), prisma };
  }

  it('only returns a banner that is active — a draft/retired banner must not be fetchable by id', async () => {
    const { service, prisma } = createService({
      id: 'b1',
      title: 'Great Deal',
    });
    await service.findOne('b1');

    expect(prisma.promoBanner.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'b1', isActive: true } }),
    );
  });
});
