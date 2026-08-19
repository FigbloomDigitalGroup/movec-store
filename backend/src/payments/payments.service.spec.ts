import * as crypto from 'crypto';
import { PaymentsService } from './payments.service';

describe('PaymentsService.verifyPaystackSignature', () => {
  const SECRET = 'test_paystack_secret_key';

  // No default value here on purpose: `createService(undefined)` must actually mock
  // an unconfigured secret, not silently fall back to a default (JS default params
  // trigger on an explicit `undefined` argument just as they do on an omitted one).
  function createService(secretKey?: string) {
    const configService = { get: jest.fn().mockReturnValue(secretKey) } as any;
    const prisma = {} as any;
    const inventoryService = {} as any;
    return new PaymentsService(prisma, configService, inventoryService);
  }

  function sign(body: string, secret: string): string {
    return crypto.createHmac('sha512', secret).update(body).digest('hex');
  }

  it('accepts a signature that matches the HMAC-SHA512 of the raw body', () => {
    const service = createService(SECRET);
    const body = JSON.stringify({
      event: 'charge.success',
      data: { reference: 'abc123' },
    });
    expect(service.verifyPaystackSignature(body, sign(body, SECRET))).toBe(
      true,
    );
  });

  it('rejects a signature that does not match', () => {
    const service = createService(SECRET);
    const body = JSON.stringify({ event: 'charge.success' });
    expect(service.verifyPaystackSignature(body, 'not-a-real-signature')).toBe(
      false,
    );
  });

  it('rejects a valid signature paired with a body tampered with after signing', () => {
    // This is the actual attack this check exists to stop: an attacker who can
    // intercept or replay a webhook cannot alter the payload (e.g. inflate the
    // paid amount or swap the order reference) without invalidating the signature.
    const service = createService(SECRET);
    const originalBody = JSON.stringify({
      event: 'charge.success',
      data: { amount: 1000 },
    });
    const signature = sign(originalBody, SECRET);
    const tamperedBody = JSON.stringify({
      event: 'charge.success',
      data: { amount: 100000 },
    });
    expect(service.verifyPaystackSignature(tamperedBody, signature)).toBe(
      false,
    );
  });

  it('fails closed when PAYSTACK_SECRET_KEY is not configured', () => {
    // An unconfigured secret must never make verification trivially bypassable —
    // it should reject everything, not accept everything.
    const service = createService();
    const body = JSON.stringify({ event: 'charge.success' });
    expect(service.verifyPaystackSignature(body, sign(body, SECRET))).toBe(
      false,
    );
  });

  it('rejects an empty signature', () => {
    const service = createService(SECRET);
    const body = JSON.stringify({ event: 'charge.success' });
    expect(service.verifyPaystackSignature(body, '')).toBe(false);
  });
});

describe('PaymentsService order ownership', () => {
  // Every initiate/capture/confirm method routes through the private findOrder()
  // helper, which must reject a userId that doesn't own the order — otherwise any
  // authenticated customer could pay against (or capture/confirm) another
  // customer's order just by knowing its order number. Exercised here via
  // initiateBankTransfer since it needs no external HTTP mocking.
  function createService(order: any) {
    const prisma = {
      order: { findUnique: jest.fn().mockResolvedValue(order) },
      payment: { create: jest.fn().mockResolvedValue({}) },
    } as any;
    const configService = { get: jest.fn() } as any;
    const inventoryService = {} as any;
    return new PaymentsService(prisma, configService, inventoryService);
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
      service.initiateBankTransfer('ORD-1', 'attacker-user'),
    ).rejects.toThrow('Order not found');
  });

  it('rejects with the same NotFoundException when the order does not exist at all', async () => {
    // Same message for "exists but not yours" and "doesn't exist" so a caller
    // can't use the response to enumerate which order numbers are real.
    const service = createService(null);
    await expect(
      service.initiateBankTransfer('ORD-MISSING', 'some-user'),
    ).rejects.toThrow('Order not found');
  });

  it('proceeds when the order belongs to the requesting user', async () => {
    const service = createService({
      id: 'o1',
      orderNumber: 'ORD-1',
      userId: 'owner-user',
      status: 'PENDING',
      total: 1000,
      payments: [],
    });

    await expect(
      service.initiateBankTransfer('ORD-1', 'owner-user'),
    ).resolves.toMatchObject({ message: expect.any(String) });
  });
});
