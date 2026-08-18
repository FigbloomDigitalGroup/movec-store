import * as crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import type { ConfigService } from '@nestjs/config';

const CSRF_COOKIE = 'XSRF-TOKEN';
const CSRF_HEADER = 'x-xsrf-token';
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const EXEMPT_PATHS = new Set(['/payments/mpesa/callback', '/payments/paystack/webhook']);

export function createCsrfMiddleware(configService: ConfigService) {
  return function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
    const isProd = configService.get<string>('NODE_ENV') === 'production';

    let token = req.cookies?.[CSRF_COOKIE];
    if (!token) {
      token = crypto.randomBytes(32).toString('hex');
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
    (req as any).csrfToken = token;

    if (!UNSAFE_METHODS.has(req.method) || EXEMPT_PATHS.has(req.path)) {
      return next();
    }

    const headerToken = req.headers[CSRF_HEADER];
    if (!headerToken || headerToken !== token) {
      return res.status(403).json({ statusCode: 403, message: 'Invalid CSRF token' });
    }

    return next();
  };
}
