import { Controller, Post, Get, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getAll(@Query() query: QueryNotificationDto) {
    return this.notificationsService.getAllNotifications(query);
  }

  @Post('send')
  sendToUser(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(
      dto.userId,
      dto.type,
      dto.title,
      dto.message,
    );
  }

  @Post('send-all')
  sendToAll(@Body() body: { type: string; title: string; message: string }) {
    return this.notificationsService.sendToAll(body.type, body.title, body.message);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }
}