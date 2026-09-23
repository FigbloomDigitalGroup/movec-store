import { BadRequestException } from '@nestjs/common';
import { InstallationService } from './installation.service';

// FIG-484: POST /admin/installation/technicians with a missing/non-existent
// userId used to fall straight through to Prisma's FK constraint and surface
// as an unhandled 500. createTechnician now checks the user exists first.
describe('InstallationService.createTechnician', () => {
  function createService(userExists: boolean, alreadyTechnician: boolean) {
    const prisma = {
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue(userExists ? { id: 'u1' } : null),
      },
      technician: {
        findUnique: jest
          .fn()
          .mockResolvedValue(alreadyTechnician ? { userId: 'u1' } : null),
        create: jest.fn().mockResolvedValue({ id: 't1', userId: 'u1' }),
      },
    } as any;

    return new InstallationService(prisma, {} as any, {} as any);
  }

  it('rejects a non-existent userId with 400, not an unhandled 500', async () => {
    const service = createService(false, false);

    await expect(service.createTechnician('missing-user')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects a user who is already a technician', async () => {
    const service = createService(true, true);

    await expect(service.createTechnician('u1')).rejects.toThrow(
      'User is already a technician',
    );
  });

  it('creates the technician when the user exists and is not already one', async () => {
    const service = createService(true, false);

    const result = await service.createTechnician('u1', 'CCTV');

    expect(result).toEqual({ id: 't1', userId: 'u1' });
  });
});
