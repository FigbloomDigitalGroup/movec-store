import {
  Controller,
  Get,
  Patch,
  Param,
  Sse,
  UseGuards,
  type MessageEvent,
} from '@nestjs/common';
import { Observable, merge, interval } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getMyNotifications(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.getMyNotifications(user.id);
  }

  // Lets the admin bell refetch the instant a new admin notification lands,
  // instead of waiting out its 30s poll. Heartbeat every 20s keeps the
  // connection alive through proxies that would otherwise time out an idle
  // long-lived response (Render/Fly included).
  @Sse('stream')
  streamNotifications(
    @CurrentUser() user: AuthenticatedUser,
  ): Observable<MessageEvent> {
    const updates$ = this.notificationsService.adminNotificationEvents$.pipe(
      filter((userId) => userId === user.id),
      map((): MessageEvent => ({ data: { type: 'update' } })),
    );
    const heartbeat$ = interval(20000).pipe(
      map((): MessageEvent => ({ data: { type: 'heartbeat' } })),
    );
    return merge(updates$, heartbeat$);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, user.id);
  }
}
