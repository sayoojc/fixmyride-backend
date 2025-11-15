import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { INotificationRepository } from "../../interfaces/repositories/INotificationRepository";
import { IProviderNotificationService } from "../../interfaces/services/provider/IProviderNotificationsService";
import { INotification } from "../../models/notification.model";
import { NotificationQuery } from "../../interfaces/notification.interface";
import { IGetNotificationsResult } from "../../interfaces/services/provider/IProviderNotificationsService";
import { Types } from "mongoose";
@injectable()
export class ProviderNotificationService
  implements IProviderNotificationService
{
  constructor(
    @inject(TYPES.NotificationRepository)
    private readonly _notificationRepository: INotificationRepository
  ) {}
  async getNotifications(
    id: string,
    search: string,
    page: number,
    filter: string,
    itemsPerPage: number,
    unreadOnly: boolean
  ): Promise<IGetNotificationsResult> {
    try {
      const query: NotificationQuery = {
        recipientId: id,
        recipientType: "provider",
      };
      if (unreadOnly) {
        query.isRead = false;
      }
      if (filter && filter !== "all") {
        query.type = filter;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } },
        ];
      }
      const totalCount = await this._notificationRepository.countDocuments(
        query
      );
      const totalPages = Math.ceil(totalCount / itemsPerPage);
      const notifications =
        await this._notificationRepository.findWithPaginationAndSearch(
          query,
          page,
          itemsPerPage
        );
         const unreadCount = await this._notificationRepository.countDocuments({
      recipientId: id,
      recipientType: "provider",
      isRead: false,
    });
      const refinedNotifications = notifications
        .map((n) => n.toObject())
        .map((n: INotification) => ({
          _id: n._id.toString(),
          recipientId: n.recipientId.toString(),
          recipientType: n.recipientType,
          type: n.type,
          message: n.message,
          link: n.link,
          isRead: n.isRead,
        }));
      return {
        refinedNotifications: refinedNotifications ?? [],
        totalPages,
        unreadCount
      };
    } catch (error) {
      return {
        refinedNotifications: [],
        totalPages: 0,
        unreadCount:0
      };
    }
  }
  async markNotificationAsRead(id: string): Promise<{ success: boolean }> {
    try {
      const result = await this._notificationRepository.findOneAndUpdate(
        { _id: id },
        { isRead: true },
        { new: true }
      );
      if (result) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      return { success: false };
    }
  }
    async markNotificationAsUnread(id: string): Promise<{ success: boolean }> {
    try {
      const result = await this._notificationRepository.findOneAndUpdate(
        { _id: id },
        { isRead: false },
        { new: true }
      );
      if (result) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      return { success: false };
    }
  }
  async deleteNotification(id:string):Promise<boolean> {
    try {
      const documentId = new Types.ObjectId(id);
      const result  = await this._notificationRepository.deleteById(documentId);
      return result;
    } catch (error) {
      return false;
    }
  }
  async markAllAsRead(id:string):Promise<boolean> {
    try {
      const providerId = new Types.ObjectId(id);
      const result = await this._notificationRepository.updateMany({recipientId:providerId},{isRead:true});
      return result.acknowledged && result.modifiedCount > 0
    } catch (error) {
      return false
    }
  }
  async getUnreadCount(providerId: string): Promise<number> {
  const unreadCount = await this._notificationRepository.countDocuments({
    recipientType:"provider",
    recipientId:providerId,
    isRead: false,
  });
  return  unreadCount;
}


}
