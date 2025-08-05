import { INotificationResponse } from "../../../dtos/services/provider/notifications.service.dto";

export interface IProviderNotificationService {
  getNotifications(
    id: string,
    search: string,
    page: number,
    filter: string,
    itemsPerPage: number,
    unreadOnly: boolean
  ): Promise<IGetNotificationsResult>;
  markNotificationAsRead(id:string):Promise<{success:boolean}>;
  markNotificationAsUnread(id:string):Promise<{success:boolean}>;
  deleteNotification(id:string):Promise<boolean>;
  markAllAsRead(id:string):Promise<boolean>;
}




export interface IGetNotificationsResult {
  refinedNotifications: INotificationResponse[];
  totalPages: number;
  unreadCount:number;
}