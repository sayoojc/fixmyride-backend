import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { INotificationRepository } from "../../interfaces/repositories/INotificationRepository";
import { IUserNotificationService } from "../../interfaces/services/user/IUserNotificationService";
import { FilterQuery, Types } from "mongoose";
import { INotification } from "../../models/notification.model";
import { NotificationDTO } from "../../dtos/controllers/admin/adminNotificatoin.controller.dto";

@injectable()
export class UserNotificationService implements IUserNotificationService {
  constructor(
    @inject(TYPES.NotificationRepository)
    private readonly _notificationRepository: INotificationRepository
  ) {}

async fetchNotifications(
  id: string,
  search: string,
  page: number,
  limit: number,
  statusFilter: string
): Promise<{
  data: NotificationDTO[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}> {
  try {
    const recipientId = new Types.ObjectId(id);
    const query: FilterQuery<INotification> = { recipientId };

    if (statusFilter === "read") query.isRead = true;
    if (statusFilter === "unread") query.isRead = false;

    if (search.trim() !== "") {
      query.$or = [
        { message: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    const [notifications, total] = await Promise.all([
      this._notificationRepository.findWithPaginationAndSearch(query, page, limit),
      this._notificationRepository.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const currentPage = Math.max(1, page);

    const formatted = notifications.map((notification) => ({
      ...notification.toObject(),
      _id: notification._id.toString(),
      recipientId: notification.recipientId.toString(),
      createdAt: notification.createdAt?.toISOString(),
    }));

    return {
      data: formatted,
      total,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

  async markNotificationAsRead(id: string): Promise<INotification> {
    try {
      const objectId = new Types.ObjectId(id);
      const notification = await this._notificationRepository.updateById(
        objectId,
        { isRead: true }
      );
      if (!notification) {
        throw new Error("Notificatio not found");
      }
      return notification;
    } catch (error) {
      throw error;
    }
  }
  async markNotificationAsUnread(id: string): Promise<INotification> {
    try {
      const objectId = new Types.ObjectId(id);
      const notification = await this._notificationRepository.updateById(
        objectId,
        { isRead: false }
      );
      if (!notification) {
        throw new Error("Notification not found");
      }
      return notification;
    } catch (error) {
      throw error;
    }
  }
  async deleteNotification(id: string):Promise<boolean> {
    try {
      const objectId = new Types.ObjectId(id);
      const deleted = await this._notificationRepository.deleteById(objectId);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
  async markAllAsRead(id:string):Promise<number> {
    try {
      const objectId = new Types.ObjectId(id);
      const marked = await this._notificationRepository.updateMany({recipientId:objectId},{isRead:true});
      return marked
    } catch (error) {
      throw error
    }
  }
   async getUnreadCount(id: string): Promise<number> {
  const unreadCount = await this._notificationRepository.countDocuments({
    recipientType:"admin",
    recipientId:id,
    isRead: false,
  });
  return  unreadCount;
}
}
