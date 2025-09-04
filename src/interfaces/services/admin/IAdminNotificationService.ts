import { NotificationDTO } from "../../../dtos/controllers/admin/adminNotificatoin.controller.dto";
import { INotification } from "../../../models/notification.model";

export interface IAdminNotificationService {
fetchNotifications(id:string,search:string,page:number,limit:number,statusFilter:string):Promise<{data:NotificationDTO[],total:number}>
markNotificationAsRead(id:string):Promise<INotification>
markNotificationAsUnread(id:string):Promise<INotification>
deleteNotification(id:string):Promise<boolean>
markAllAsRead(id:string):Promise<number>
}
