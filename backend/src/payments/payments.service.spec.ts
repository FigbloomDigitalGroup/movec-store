import { PaymentsService } from './payments.service';

describe('PaymentsService order ownership', () => {
  // Every initiate/capture/confirm method routes through the private findOrder()
  // helper, which must reject a userId that doesn't own the order — otherwise any
  // authenticated customer could pay against (or capture/confirm) another
  // customer's order just by knowing its order number. Exercised here via
  // initiatePaybillTill since it needs no external HTTP mocking.
  function createService(order: any) {
    const prisma = {
      order: { findUnique: jest.fn().mockResolvedValue(order) },
      payment: { create: jest.fn().mockResolvedValue({}) },
      paymentSettings: {
        upsert: jest.fn().mockResolvedValue({
          paybillEnabled: true,
          paybillNumber: '400200',
          tillEnabled: true,
          tillNumber: '100200',
          codDepositThreshold: { toNumber: () => 0 },
          codDepositPercentage: { toNumber: () => 0 },
        }),
      },
    } as any;
    const configService = { get: jest.fn() } as any;
    const inventoryService = {} as any;
    const emailService = {} as any;
    const notificationsService = {} as any;
    return new PaymentsService(
      prisma,
      configService,
      inventoryService,
      emailService,
      notificationsService,
    );
  }

  it('rejects with NotFoundException when the order belongs to a different user', async () => {
    const service = createService({
      id: 'o1',
      orderNumber: 'ORD-1',
      userId: 'owner-user',
      status: 'PENDING',
      payments: [],
    });

    await expect(
      service.initiatePaybillTill('ORD-1', 'attacker-user', 'PAYBILL'),
    ).rejects.toThrow('Order not found');
  });

  it('rejects with the same NotFoundException when the order does not exist at all', async () => {
    // Same message for "exists but not yours" and "doesn't exist" so a caller
    // can't use the response to enumerate which order numbers are real.
    const service = createService(null);
    await expect(
      service.initiatePaybillTill('ORD-MISSING', 'some-user', 'PAYBILL'),
    ).rejects.toThrow('Order not found');
  });

  it('proceeds when the order belongs to the requesting user', async () => {
    const service = createService({
      id: 'o1',
      orderNumber: 'ORD-1',
      userId: 'owner-user',
      status: 'PENDING',
      total: { toNumber: () => 1000 },
      payments: [],
    });

    await expect(
      service.initiatePaybillTill('ORD-1', 'owner-user', 'PAYBILL'),
    ).resolves.toMatchObject({ message: expect.any(String) });
  });
});
