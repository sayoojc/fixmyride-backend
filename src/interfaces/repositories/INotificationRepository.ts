import { IBaseRepository } from "./IBaseRepository";
import { INotification } from "../../models/notification.model";
import { FilterQuery } from "mongoose";
export interface INotificationRepository extends IBaseRepository<INotification> {
   insertMany(notifications: Partial<INotification>[]): Promise<INotification[]>;
   findWithPaginationAndSearch(query:FilterQuery<INotification>,page:number,itemsPerPage:number):Promise<INotification[]>;
   countDocuments(query: FilterQuery<INotification>): Promise<number>;
}