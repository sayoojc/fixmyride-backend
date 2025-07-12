import { IBaseRepository } from "./IBaseRepository";
import { INotification } from "../../models/notification.model";

export interface INotificationRepository extends IBaseRepository<INotification> {
   insertMany(notifications: Partial<INotification>[]): Promise<INotification[]>;

}