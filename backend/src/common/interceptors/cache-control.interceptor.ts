import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response, Request } from 'express';
import { CACHE_CONTROL_KEY } from '../decorators/cache-control.decorator';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Only apply Cache-Control headers to GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheHeader = this.reflector.getAllAndOverride<string>(
      CACHE_CONTROL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (cacheHeader) {
      return next.handle().pipe(
        tap(() => {
          response.setHeader('Cache-Control', cacheHeader);
          response.setHeader('Vary', 'Accept-Encoding');
        }),
      );
    }

    return next.handle();
  }
}
