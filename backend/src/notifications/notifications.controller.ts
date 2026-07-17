import { Controller, Get, Patch, Param, Post, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getMyNotifications(@Req() req: Request) {
    const user = req.user as any;
    return this.notificationsService.getMyNotifications(user.id);
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: Request) {
    const user = req.user as any;
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: Request) {
    const user = req.user as any;
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return this.notificationsService.markAsRead(id, user.id);
  }
}