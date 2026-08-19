import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AdminAuditController } from './admin-audit.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminAuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
