import { ModulesService } from './modules.service';

describe('ModulesService.findOne', () => {
  function createService(mod: any) {
    const prisma = {
      storeModule: { findFirst: jest.fn().mockResolvedValue(mod) },
    } as any;
    const cacheManager = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn(),
    };
    const service = new ModulesService(prisma, cacheManager);
    return { service, prisma };
  }

  it('only returns a module that is active — a hidden/retired module must not be fetchable by slug', async () => {
    const { service, prisma } = createService({ id: 'm1', slug: 'starlink' });
    await service.findOne('starlink');

    expect(prisma.storeModule.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'starlink', isActive: true } }),
    );
  });

  it('throws NotFoundException when no active module matches the slug', async () => {
    const { service } = createService(null);
    await expect(service.findOne('missing')).rejects.toThrow(
      'Module "missing" not found',
    );
  });
});
