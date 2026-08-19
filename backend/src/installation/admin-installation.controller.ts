import { Controller, Get, Patch, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { InstallationService } from './installation.service';
import { UpdateInstallationRequestDto } from './dto/update-installation-request.dto';
import { QueryInstallationRequestDto } from './dto/query-installation-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

@Controller('admin/installation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminInstallationController {
  constructor(private readonly installationService: InstallationService) {}

  @Get('requests')
  getAllRequests(@Query() query: QueryInstallationRequestDto) {
    return this.installationService.getAllRequests(query);
  }

  @Patch('requests/:id')
  updateRequest(@Param('id') id: string, @Body() dto: UpdateInstallationRequestDto) {
    return this.installationService.updateRequest(id, dto);
  }

  @Get('technicians')
  getTechnicians() {
    return this.installationService.getTechnicians();
  }

  @Post('technicians')
  createTechnician(@Body() body: { userId: string; specialization?: string }) {
    return this.installationService.createTechnician(body.userId, body.specialization);
  }
}