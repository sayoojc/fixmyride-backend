import { Container } from "inversify";
import { AdminNotificationController } from "../../../controllers/admin/notification.controller";
import { AdminNotificationService } from "../../../services/admin/notification.service";
import { IAdminNotificationService } from "../../../interfaces/services/admin/IAdminNotificationService";
import { IAdminNotificationController } from "../../../interfaces/controllers/admin/IAdminNotificationController";
import { INotificationRepository } from "../../../interfaces/repositories/INotificationRepository";
import { TYPES } from "../../types";

export const bindAdminNotificationModule = (container: Container) => {
  container
    .bind<IAdminNotificationService>(TYPES.AdminNotificationService)
    .toDynamicValue(() => {
      const notificationRepo = container.get<INotificationRepository>(TYPES.NotificationRepository);
      return new AdminNotificationService(notificationRepo);
    })
    .inSingletonScope();
  container
    .bind<IAdminNotificationController>(TYPES.AdminNotificationController)
    .to(AdminNotificationController)
    .inSingletonScope();
};
