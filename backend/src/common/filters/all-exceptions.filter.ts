import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from '@prisma/client';

// Known Prisma error codes mapped to the HttpException a client should actually see,
// instead of the raw Prisma message (which can expose column/table names).
function mapKnownPrismaError(exception: Prisma.PrismaClientKnownRequestError): HttpException | null {
  switch (exception.code) {
    case 'P2002': {
      const target = (exception.meta?.target as string[] | undefined)?.join(', ');
      return new ConflictException(target ? `${target} already exists` : 'This record already exists');
    }
    case 'P2025':
      return new HttpException('The requested record was not found', HttpStatus.NOT_FOUND);
    default:
      return null;
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;
    let resolved: unknown = exception;

    if (resolved instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = mapKnownPrismaError(resolved);
      if (mapped) resolved = mapped;
    }

    if (resolved instanceof HttpException) {
      status = resolved.getStatus();
      const exceptionResponse = resolved.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || resolved.message;
        errors = resp.errors;
      }
      // Failed auth/authorization attempts are worth keeping in the server log even
      // though they're "expected" HttpExceptions, not unhandled errors.
      if ([401, 403, 429].includes(status)) {
        const user = (request as any).user;
        this.logger.warn(
          `${status} ${request?.method} ${request?.originalUrl} — User: ${user?.email || 'anonymous'} — IP: ${request?.ip} — ${message}`,
        );
      }
    } else if (resolved instanceof Error) {
      // Log the real message/stack server-side, but never hand it to the client —
      // it can contain internal details (Prisma column names, stack frames, etc.).
      this.logger.error(`Unhandled error: ${resolved.message}`, resolved.stack);
    }

    response.status(status).json({
      success: false,
      error: {
        code: status,
        message,
        ...(errors ? { details: errors } : {}),
      },
    });
  }
}