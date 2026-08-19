import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

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

  async sendNotification(userId: string, type: string, title: string, message: string) {
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

  async getAllNotifications() {
    return this.prisma.notification.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
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