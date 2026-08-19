import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface AuditLogParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  // Fire-and-forget by design: an audit trail write failing must never fail the
  // admin action it's recording. Errors are logged, not thrown.
  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: params.userId ?? null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          oldValues: params.oldValues as Prisma.InputJsonValue | undefined,
          newValues: params.newValues as Prisma.InputJsonValue | undefined,
          ipAddress: params.ipAddress,
        },
      });
    } catch (error) {
      this.logger.error('Failed to write audit log entry', error);
    }
  }
}
