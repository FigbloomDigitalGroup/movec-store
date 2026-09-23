import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponsService } from './coupons.service';

describe('CouponsService', () => {
  function createService(coupon: any) {
    const prisma = {
      coupon: {
        findUnique: jest.fn().mockResolvedValue(coupon),
        create: jest
          .fn()
          .mockImplementation(({ data }) =>
            Promise.resolve({ id: 'c1', usedCount: 0, ...data }),
          ),
        update: jest
          .fn()
          .mockImplementation(({ data }) =>
            Promise.resolve({ ...coupon, ...data }),
          ),
        delete: jest.fn().mockResolvedValue(undefined),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as any;
    return { service: new CouponsService(prisma), prisma };
  }

  it('creates a coupon, trimming the code but never changing its case (checkout matches exactly)', async () => {
    const { service, prisma } = createService(null);
    await service.create({
      code: '  SAVE20  ',
      discountType: 'PERCENTAGE',
      discountValue: 20,
    });
    expect(prisma.coupon.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: 'SAVE20' }),
      }),
    );
  });

  it('refuses to delete a coupon that has already been used', async () => {
    const { service } = createService({ id: 'c1', usedCount: 3 });
    await expect(service.remove('c1')).rejects.toThrow(BadRequestException);
  });

  it('allows deleting a coupon that was never used', async () => {
    const { service, prisma } = createService({ id: 'c1', usedCount: 0 });
    await service.remove('c1');
    expect(prisma.coupon.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
  });

  it('throws NotFoundException for a coupon id that does not exist', async () => {
    const { service } = createService(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
