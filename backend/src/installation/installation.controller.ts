import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InstallationService } from './installation.service';
import { CreateInstallationRequestDto } from './dto/create-installation-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

@Controller('installation')
export class InstallationController {
  constructor(private readonly installationService: InstallationService) {}

  @Get('services')
  getServices() {
    return this.installationService.getServices();
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  getMyRequests(@CurrentUser() user: AuthenticatedUser) {
    return this.installationService.getMyRequests(user.id);
  }

  @Post('requests')
  @UseGuards(JwtAuthGuard)
  createRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInstallationRequestDto,
  ) {
    return this.installationService.createRequest(user.id, dto);
  }
}
