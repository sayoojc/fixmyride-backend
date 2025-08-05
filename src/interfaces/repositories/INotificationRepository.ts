import { IBaseRepository } from "./IBaseRepository";
import { INotification } from "../../models/notification.model";
import { NotificationQuery } from "../../interfaces/notification.interface";

export interface INotificationRepository extends IBaseRepository<INotification> {
   insertMany(notifications: Partial<INotification>[]): Promise<INotification[]>;
   findWithPaginationAndSearch(query:NotificationQuery,page:number,itemsPerPage:number):Promise<INotification[]>;
   countDocuments(query: NotificationQuery): Promise<number>;
}