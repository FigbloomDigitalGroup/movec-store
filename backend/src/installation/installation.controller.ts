import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { InstallationService } from './installation.service';
import { CreateInstallationRequestDto } from './dto/create-installation-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('installation')
export class InstallationController {
  constructor(private readonly installationService: InstallationService) {}

  @Get('services')
  getServices() {
    return this.installationService.getServices();
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  getMyRequests(@Req() req: Request) {
    const user = req.user as any;
    return this.installationService.getMyRequests(user.id);
  }

  @Post('requests')
  @UseGuards(JwtAuthGuard)
  createRequest(@Req() req: Request, @Body() dto: CreateInstallationRequestDto) {
    const user = req.user as any;
    return this.installationService.createRequest(user.id, dto);
  }
}