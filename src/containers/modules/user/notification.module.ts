import { Container } from "inversify";
import { UserNotificationController } from "../../../controllers/user/notification.controller";
import { UserNotificationService } from "../../../services/user/notification.service";
import { IUserNotificationService } from "../../../interfaces/services/user/IUserNotificationService";
import { IUserNotificationController } from "../../../interfaces/controllers/user/IUserNotificationController";
import { INotificationRepository } from "../../../interfaces/repositories/INotificationRepository";
import { TYPES } from "../../types";

export const bindUserNotificationModule = (container: Container) => {
  container
    .bind<IUserNotificationService>(TYPES.UserNotificationService)
    .toDynamicValue(() => {
      const notificationRepo = container.get<INotificationRepository>(TYPES.NotificationRepository);
      return new UserNotificationService(notificationRepo);
    })
    .inSingletonScope();
  container
    .bind<IUserNotificationController>(TYPES.UserNotificationController)
    .to(UserNotificationController)
    .inSingletonScope();
};
