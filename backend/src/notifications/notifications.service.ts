import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(
    userId: Types.ObjectId | string,
    title: string,
    message: string,
    type = 'APPLICATION_APPLIED',
    link = '',
  ): Promise<NotificationDocument | null> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    // Prevent duplicate notification for identical action created within last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const existing = await this.notificationModel.findOne({
      userId: userObjectId,
      title,
      type,
      createdAt: { $gte: twoMinutesAgo },
    });

    if (existing) {
      return existing;
    }

    const notification = new this.notificationModel({
      userId: userObjectId,
      title,
      message,
      type,
      link,
      read: false,
    });

    return notification.save();
  }

  async getUserNotifications(
    userId: Types.ObjectId | string,
    limit = 20,
  ): Promise<{ notifications: NotificationDocument[]; unreadCount: number }> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const [notifications, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ userId: userObjectId, read: false }),
    ]);

    return { notifications, unreadCount };
  }

  async getUnreadCount(userId: Types.ObjectId | string): Promise<number> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return this.notificationModel.countDocuments({ userId: userObjectId, read: false });
  }

  async markAsRead(
    userId: Types.ObjectId | string,
    notificationId: string,
  ): Promise<NotificationDocument | null> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), userId: userObjectId },
      { $set: { read: true } },
      { new: true },
    );
  }

  async markAllAsRead(userId: Types.ObjectId | string): Promise<{ success: boolean }> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    await this.notificationModel.updateMany(
      { userId: userObjectId, read: false },
      { $set: { read: true } },
    );
    return { success: true };
  }
}
