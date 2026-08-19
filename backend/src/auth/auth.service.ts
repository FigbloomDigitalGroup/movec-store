import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RoleName } from '@prisma/client';

// Standing credentials (refresh tokens, reset/verification tokens) are hashed before
// being persisted — a database-only compromise (backup leak, misconfigured replica)
// then can't be used directly to mint sessions or reset passwords. The token that's
// actually emailed/cookied to the user is always the raw, unhashed value; only the
// stored copy is a hash, looked up by hashing the incoming value the same way.
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Parses simple "7d" / "15m" / "1h" / "30s" durations (the format already used by
// JWT_EXPIRATION/JWT_REFRESH_EXPIRATION) into milliseconds, so a session's DB-stored
// expiresAt can be derived from the same config value that signs the JWT, instead of
// a second hardcoded literal that silently drifts from it.
function parseDurationMs(duration: string, fallbackMs: number): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(duration?.trim() ?? '');
  if (!match) return fallbackMs;
  const value = Number(match[1]);
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[
    match[2] as 's' | 'm' | 'h' | 'd'
  ];
  return value * unitMs;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory map for rate limiting resend requests (email -> timestamp)
  private resendTimestamps: Record<string, number> = {};

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  private get refreshSessionTtlMs(): number {
    return parseDurationMs(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') ?? '7d',
      7 * 24 * 60 * 60 * 1000,
    );
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const autoVerify =
      this.configService.get<string>('AUTO_VERIFY_EMAIL') === 'true';

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        verificationToken: autoVerify ? null : hashToken(verificationToken),
        verificationTokenExpires: autoVerify ? null : verificationTokenExpires,
        isEmailVerified: autoVerify,
        userRoles: {
          create: {
            role: {
              connect: { name: RoleName.CUSTOMER },
            },
          },
        },
      },
    });

    if (!autoVerify) {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        verificationToken,
      );
    }

    return {
      id: user.id,
      email: user.email,
      message: autoVerify
        ? 'Registration successful. You can now log in.'
        : 'Registration successful. Please verify your email.',
    };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // generic response to avoid user enumeration
      return {
        message: 'If the email exists, a verification email has been sent.',
      };
    }

    if (user.isEmailVerified) {
      return {
        message: 'If the email exists, a verification email has been sent.',
      };
    }

    const now = Date.now();
    const last = this.resendTimestamps[email] || 0;
    if (now - last < 60 * 1000) {
      const waitSec = Math.ceil((60 * 1000 - (now - last)) / 1000);
      throw new BadRequestException(
        `Please wait ${waitSec} seconds before requesting another verification email.`,
      );
    }
    this.resendTimestamps[email] = now;

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: hashToken(verificationToken),
        verificationTokenExpires,
      },
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      user.firstName,
      verificationToken,
    );

    return {
      message: 'If the email exists, a verification email has been sent.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    if (!user.isActive || user.isSuspended) {
      throw new UnauthorizedException('Account is not active');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') as string,
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRATION',
      ) as any,
    });

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + this.refreshSessionTtlMs),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.userRoles.map((ur) => ur.role.name),
      },
    };
  }

  async refreshToken(refreshToken: string) {
    let payload: { sub: string; email: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') as string,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.session.findFirst({
      where: { refreshToken: hashToken(refreshToken), userId: payload.sub },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }

    await this.prisma.session.delete({ where: { id: session.id } });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user || !user.isActive || user.isSuspended) {
      throw new UnauthorizedException();
    }

    const newPayload = { sub: user.id, email: user.email };
    const newAccessToken = this.jwtService.sign(newPayload);
    const newRefreshToken = this.jwtService.sign(newPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') as string,
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRATION',
      ) as any,
    });

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + this.refreshSessionTtlMs),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await this.prisma.session.deleteMany({ where: { userId } });
    return { message: 'Logged out successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: hashToken(token),
        verificationTokenExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashToken(resetToken), resetTokenExpires },
    });

    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetToken,
    );

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: hashToken(token),
        resetTokenExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    // A password reset is often an incident-response action (e.g. the account was
    // compromised) — any refresh token issued before the reset must stop working,
    // otherwise a stolen token keeps minting new access tokens regardless.
    await this.prisma.session.deleteMany({ where: { userId: user.id } });

    return { message: 'Password reset successful. Please log in.' };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Same reasoning as resetPassword(): revoke every existing session so a
    // stolen refresh token can't outlive the password change that was meant to
    // shut it out.
    await this.prisma.session.deleteMany({ where: { userId } });

    return { message: 'Password changed successfully' };
  }
}
