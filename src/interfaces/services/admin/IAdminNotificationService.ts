import { NotificationDTO } from "../../../dtos/controllers/admin/adminNotificatoin.controller.dto";

export interface IAdminNotificationService {
fetchNotifications(id:string,search:string,page:number,limit:number,statusFilter:string):Promise<{data:NotificationDTO[],total:number}>
}
