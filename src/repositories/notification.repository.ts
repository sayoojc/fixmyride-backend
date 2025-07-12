import { BaseRepository } from "./base/base.repo";
import { INotification } from "../models/notification.model";
import { Model as MongooseModel } from "mongoose";
import { INotificationRepository } from "../interfaces/repositories/INotificationRepository";

export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
  constructor(notificationModel: MongooseModel<INotification>) {
    super(notificationModel);
    
  }
  async insertMany(notifications: INotification[]): Promise<INotification[]> {
    console.log("📨 Attempting to insert notifications:", notifications);

    try {
      const result = await this.model.insertMany(notifications, { ordered: true });
      console.log("✅ MongoDB insertMany result:", result);
      return result;
    } catch (err) {
      console.error("❌ Failed to insert notifications into MongoDB:", err);
      throw err;
    }
  }

}
