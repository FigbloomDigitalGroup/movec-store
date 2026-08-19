import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AUDIT');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
          this.logger.log(`${method} ${url} - User: ${user?.email || 'anonymous'} - IP: ${ip} - ${Date.now() - now}ms`);
        }
      }),
      catchError((err) => {
        // The success-only tap() above used to mean a failed request (401/403/500,
        // a rejected login, a blocked write) left no audit trail at all.
        this.logger.warn(
          `${method} ${url} - User: ${user?.email || 'anonymous'} - IP: ${ip} - FAILED (${err?.status || 'error'}) - ${Date.now() - now}ms`,
        );
        throw err;
      }),
    );
  }
}