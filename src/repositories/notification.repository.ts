import { BaseRepository } from "./base/base.repo";
import { INotification } from "../models/notification.model";
import { Model as MongooseModel } from "mongoose";
import { INotificationRepository } from "../interfaces/repositories/INotificationRepository";
import { NotificationQuery } from "../interfaces/notification.interface";
import { FilterQuery } from "mongoose";
export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
  constructor(notificationModel: MongooseModel<INotification>) {
    super(notificationModel);
    
  }
  async insertMany(notifications: INotification[]): Promise<INotification[]> {
    try {
      const result = await this.model.insertMany(notifications, { ordered: true });
      console.log("MongoDB insertMany result:", result);
      return result;
    } catch (err) {
      console.error("Failed to insert notifications into MongoDB:", err);
      throw err;
    }
  }
  async findWithPaginationAndSearch(
  query: FilterQuery<INotification>,
  page: number,
  itemsPerPage: number
): Promise<INotification[]> {
  const skip = (page - 1) * itemsPerPage;
  return this.model
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(itemsPerPage);
}
async countDocuments(query: NotificationQuery): Promise<number> {
  return this.model.countDocuments(query);
}
}
