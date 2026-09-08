import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Subject } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { buildPagination, paginated } from '../common/pagination';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // Pushes the userId of whoever just got a new admin notification, so the SSE
  // stream in NotificationsController can nudge that admin's open tab to refetch
  // instead of waiting for its 30s poll. Not wired into sendNotification/sendToAll
  // — there's no live customer-facing inbox yet, only the admin bell.
  private readonly adminNotificationEvents = new Subject<string>();
  readonly adminNotificationEvents$ = this.adminNotificationEvents.asObservable();

  constructor(private prisma: PrismaService) {}

  async getMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  }

  async sendNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, message },
    });

    this.logger.log(`Notification sent to user ${userId}: ${title}`);

    return notification;
  }

  async sendToAll(type: string, title: string, message: string) {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    // One INSERT for every recipient instead of one round trip per user —
    // matters once the active-user count reaches the thousands.
    await this.prisma.notification.createMany({
      data: users.map((user) => ({ userId: user.id, type, title, message })),
    });

    this.logger.log(`Notification sent to ${users.length} users: ${title}`);

    return { sent: users.length };
  }

  async notifyAdmins(type: string, title: string, message: string) {
    try {
      const admins = await this.prisma.user.findMany({
        where: {
          isActive: true,
          userRoles: { some: { role: { name: 'ADMIN' } } },
        },
        select: { id: true },
      });

      if (!admins.length) return { sent: 0 };

      await this.prisma.notification.createMany({
        data: admins.map((admin) => ({ userId: admin.id, type, title, message })),
      });

      admins.forEach((admin) => this.adminNotificationEvents.next(admin.id));

      this.logger.log(`Admin notification sent to ${admins.length} admins: ${title}`);

      return { sent: admins.length };
    } catch (error) {
      this.logger.error('Failed to notify admins:', error);
      return { sent: 0 };
    }
  }

  async getAllNotifications(query: QueryNotificationDto) {
    const { page, limit, skip } = buildPagination(query);
    const where: Prisma.NotificationWhereInput = {};
    if (query.type) where.type = query.type;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return paginated(data, total, page, limit);
  }

  async deleteNotification(id: string) {
    await this.prisma.notification.delete({ where: { id } });
    return { message: 'Notification deleted' };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
