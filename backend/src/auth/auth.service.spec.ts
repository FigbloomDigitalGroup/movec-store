import { UnauthorizedException } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';

// A namespace import's properties aren't configurable under ts-jest's CJS
// interop, so jest.spyOn(bcrypt, 'compare') throws "Cannot redefine
// property" -- jest.mock() is the correct way to stub a CommonJS module here.
jest.mock('bcrypt');

// Live-verified end-to-end against a real DB during development (lockout,
// full TOTP enrollment, wrong/correct/backup codes, disable) — this suite
// exists so a future refactor of this file has *some* automated regression
// coverage, since none existed for AuthService at all before this change.
describe('AuthService — lockout and MFA', () => {
  function createService(userOverrides: Record<string, unknown> = {}) {
    const baseUser = {
      id: 'u1',
      email: 'test@example.com',
      passwordHash: 'irrelevant-not-compared-in-these-tests',
      failedLoginAttempts: 0,
      lockedUntil: null,
      isEmailVerified: true,
      isActive: true,
      isSuspended: false,
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: [] as string[],
      userRoles: [{ role: { name: 'CUSTOMER' } }],
      ...userOverrides,
    };

    const updateCalls: any[] = [];
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(baseUser),
        update: jest.fn().mockImplementation(({ data }) => {
          updateCalls.push(data);
          return Promise.resolve({ ...baseUser, ...data });
        }),
      },
      session: { create: jest.fn().mockResolvedValue({}) },
    } as any;

    const jwtService = {
      sign: jest.fn().mockReturnValue('signed.jwt.token'),
      verify: jest.fn(),
    } as any;
    const configService = {
      get: jest.fn((key: string, fallback?: unknown) => fallback),
    } as any;
    const emailService = {} as any;

    const service = new AuthService(
      prisma,
      jwtService,
      configService,
      emailService,
    );
    return { service, prisma, jwtService, updateCalls, baseUser };
  }

  it('rejects login with the correct password while the account is locked, without even checking it', async () => {
    const future = new Date(Date.now() + 10 * 60 * 1000);
    const { service, prisma } = createService({ lockedUntil: future });

    await expect(
      service.login({ email: 'test@example.com', password: 'anything' }),
    ).rejects.toThrow(/too many failed login attempts/i);

    // Locked-out check must short-circuit before ever touching bcrypt/DB writes.
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('locks the account on the 5th wrong-password attempt (not the 4th)', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const { service, updateCalls } = createService({ failedLoginAttempts: 4 });

    await expect(
      service.login({ email: 'test@example.com', password: 'wrong' }),
    ).rejects.toThrow('Invalid credentials');

    expect(updateCalls).toEqual([
      expect.objectContaining({
        failedLoginAttempts: 0,
        lockedUntil: expect.any(Date),
      }),
    ]);
    jest.clearAllMocks();
  });

  it('does not lock the account before the 5th attempt', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const { service, updateCalls } = createService({ failedLoginAttempts: 1 });

    await expect(
      service.login({ email: 'test@example.com', password: 'wrong' }),
    ).rejects.toThrow('Invalid credentials');

    expect(updateCalls).toEqual([
      expect.objectContaining({
        failedLoginAttempts: 2,
        lockedUntil: undefined,
      }),
    ]);
    jest.clearAllMocks();
  });

  it('returns an MFA challenge instead of a session when the account has MFA enabled', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const { service } = createService({
      mfaEnabled: true,
      mfaSecret: 'ABCDEFGHIJKLMNOP',
    });

    const result = await service.login({
      email: 'test@example.com',
      password: 'correct',
    });

    expect(result).toEqual({
      mfaRequired: true,
      mfaTicket: 'signed.jwt.token',
    });
    jest.clearAllMocks();
  });

  it('verifyMfaLogin rejects a wrong TOTP code and a wrong backup code', async () => {
    const { service, jwtService } = createService({
      mfaEnabled: true,
      mfaSecret: authenticator.generateSecret(),
      mfaBackupCodes: ['some-other-hashed-code'],
    });
    jwtService.verify.mockReturnValue({ sub: 'u1', purpose: 'mfa-challenge' });

    await expect(service.verifyMfaLogin('ticket', '000000')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('verifyMfaLogin accepts a valid TOTP code and issues a real session', async () => {
    const secret = authenticator.generateSecret();
    const { service, jwtService } = createService({
      mfaEnabled: true,
      mfaSecret: secret,
    });
    jwtService.verify.mockReturnValue({ sub: 'u1', purpose: 'mfa-challenge' });

    const validCode = authenticator.generate(secret);
    const result = await service.verifyMfaLogin('ticket', validCode);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.email).toBe('test@example.com');
  });

  it('verifyMfaLogin consumes a backup code so it cannot be reused', async () => {
    const hashToken = (t: string) =>
      crypto.createHash('sha256').update(t).digest('hex');
    const plainCode = 'abcd1234ef';
    const { service, jwtService, updateCalls } = createService({
      mfaEnabled: true,
      mfaSecret: authenticator.generateSecret(),
      mfaBackupCodes: [hashToken(plainCode), 'another-hashed-code'],
    });
    jwtService.verify.mockReturnValue({ sub: 'u1', purpose: 'mfa-challenge' });

    const result = await service.verifyMfaLogin('ticket', plainCode);

    expect(result).toHaveProperty('accessToken');
    expect(updateCalls).toEqual([
      expect.objectContaining({ mfaBackupCodes: ['another-hashed-code'] }),
    ]);
  });
});
