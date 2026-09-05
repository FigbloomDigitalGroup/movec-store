import { AuditService } from './audit.service';

describe('AuditService.log', () => {
  function createService(createImpl: () => Promise<unknown>) {
    const prisma = { auditLog: { create: jest.fn(createImpl) } } as any;
    return { service: new AuditService(prisma), prisma };
  }

  it('writes an entry with the given fields', async () => {
    const { service, prisma } = createService(() => Promise.resolve({}));
    await service.log({
      userId: 'admin-1',
      action: 'UPDATE',
      entityType: 'User',
      entityId: 'user-1',
      oldValues: { isActive: true },
      newValues: { isActive: false },
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'admin-1',
        action: 'UPDATE',
        entityType: 'User',
        entityId: 'user-1',
        oldValues: { isActive: true },
        newValues: { isActive: false },
      }),
    });
  });

  it('defaults a missing userId to null rather than leaving it undefined', async () => {
    const { service, prisma } = createService(() => Promise.resolve({}));
    await service.log({
      action: 'DELETE',
      entityType: 'Review',
      entityId: 'r1',
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: null }),
    });
  });

  // The whole point of this being fire-and-forget: a broken audit write must
  // never surface as a failure of the admin action it's recording.
  it('does not throw when the database write fails', async () => {
    const { service } = createService(() =>
      Promise.reject(new Error('db down')),
    );
    await expect(
      service.log({ action: 'DELETE', entityType: 'Review', entityId: 'r1' }),
    ).resolves.toBeUndefined();
  });
});
