import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';
import {
  buildPagination,
  paginated,
  type PaginationQuery,
} from '../common/pagination';

interface QueryAuditLogDto extends PaginationQuery {
  entityType?: string;
}

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminAuditController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query() query: QueryAuditLogDto) {
    const { page, limit, skip } = buildPagination(query);
    const where = query.entityType ? { entityType: query.entityType } : {};

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return paginated(data, total, page, limit);
  }
}
