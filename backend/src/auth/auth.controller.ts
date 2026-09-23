import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { MfaVerifyLoginDto } from './dto/mfa-verify-login.dto';
import { ConfirmMfaSetupDto } from './dto/confirm-mfa-setup.dto';
import { DisableMfaDto } from './dto/disable-mfa.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginThrottleGuard } from './guards/login-throttle.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from './decorators/current-user.decorator';
import type { Request, Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from './cookie.util';
import type { RequestWithCsrf } from '../common/middleware/csrf.middleware';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private get isProd(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  @Get('csrf')
  getCsrfToken(@Req() req: RequestWithCsrf) {
    return { csrfToken: req.csrfToken };
  }

  @Post('register')
  @UseGuards(LoginThrottleGuard)
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoginThrottleGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    if ('mfaRequired' in result) {
      return { mfaRequired: true, mfaTicket: result.mfaTicket };
    }
    res.cookie(
      ACCESS_TOKEN_COOKIE,
      result.accessToken,
      accessTokenCookieOptions(this.isProd),
    );
    res.cookie(
      REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      refreshTokenCookieOptions(this.isProd),
    );
    return { user: result.user };
  }

  // Second step of login when the account has MFA enabled — takes the
  // short-lived ticket from the first step plus a TOTP or backup code, and on
  // success issues the exact same cookies a non-MFA login would.
  @Post('mfa/login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoginThrottleGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async mfaLogin(
    @Body() dto: MfaVerifyLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyMfaLogin(
      dto.mfaTicket,
      dto.code,
    );
    res.cookie(
      ACCESS_TOKEN_COOKIE,
      result.accessToken,
      accessTokenCookieOptions(this.isProd),
    );
    res.cookie(
      REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      refreshTokenCookieOptions(this.isProd),
    );
    return { user: result.user };
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  setupMfa(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.setupMfa(user.id);
  }

  @Post('mfa/setup/confirm')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  confirmMfaSetup(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConfirmMfaSetupDto,
  ) {
    return this.authService.confirmMfaSetup(user.id, dto.code);
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  disableMfa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DisableMfaDto,
  ) {
    return this.authService.disableMfa(user.id, dto.code);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoginThrottleGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as
      string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    const result = await this.authService.refreshToken(refreshToken);
    res.cookie(
      ACCESS_TOKEN_COOKIE,
      result.accessToken,
      accessTokenCookieOptions(this.isProd),
    );
    res.cookie(
      REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      refreshTokenCookieOptions(this.isProd),
    );
    return { success: true };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(user.id);
    res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions(this.isProd));
    res.clearCookie(
      REFRESH_TOKEN_COOKIE,
      refreshTokenCookieOptions(this.isProd),
    );
    return result;
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoginThrottleGuard)
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoginThrottleGuard)
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoginThrottleGuard)
  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
