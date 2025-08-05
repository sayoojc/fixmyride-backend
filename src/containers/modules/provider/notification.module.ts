import { Container } from "inversify";
import { TYPES } from "../../types";

import { ProviderNotificationController } from "../../../controllers/provider/notification.controller";
import { ProviderNotificationService } from "../../../services/provider/notification.service";
import { IProviderNotificationService } from "../../../interfaces/services/provider/IProviderNotificationsService";
import { IProviderNotificationController } from "../../../interfaces/controllers/provider/IProviderNotificationController";
import { NotificationRepository } from "../../../repositories/notification.repository";
import { INotificationRepository } from "../../../interfaces/repositories/INotificationRepository";
export const bindProviderNotificationModule = (container: Container) => {
  container
    .bind<IProviderNotificationService>(TYPES.ProviderNotificationService)
    .toDynamicValue(() => {
      const notificationRepo = container.get<INotificationRepository>(
        TYPES.NotificationRepository
      );
    
      return new ProviderNotificationService(notificationRepo);
    })
    .inSingletonScope();

  container
    .bind<IProviderNotificationController>(TYPES.ProviderNotificationController)
    .to(ProviderNotificationController)
    .inSingletonScope();
};
