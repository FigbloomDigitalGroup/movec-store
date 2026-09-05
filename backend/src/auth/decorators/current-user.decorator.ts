import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { RoleName } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: RoleName[];
}

/**
 * Replaces `@Req() req: Request` + `req.user as any` — that cast made every
 * subsequent `.id`/`.email`/`.roles` access untyped, which is what was behind
 * the vast majority of the backend's eslint no-unsafe-* errors. JwtStrategy's
 * validate() is the single source of truth for this shape.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>();
    return request.user;
  },
);
