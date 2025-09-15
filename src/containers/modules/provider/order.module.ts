import { Container } from "inversify";
import { TYPES } from "../../types";

import { ProviderOrderController } from "../../../controllers/provider/order.controller";
import { ProviderOrderService } from "../../../services/provider/order.service";
import { IProviderOrderController } from "../../../interfaces/controllers/provider/IProviderOrderController";
import { IProviderOrderService } from "../../../interfaces/services/provider/IProviderOrderService";
import { IOrderRepository } from "../../../interfaces/repositories/IOrderRepository";
import { ISocketService } from "../../../sockets/ISocketService";
import { INotificationRepository } from "../../../interfaces/repositories/INotificationRepository";
import { IProviderRepository } from "../../../interfaces/repositories/IProviderRepository";

export const bindProviderOrderModule = (container: Container) => {
  container
    .bind<IProviderOrderService>(TYPES.ProviderOrderService)
    .toDynamicValue(() => {
      const orderRepo = container.get<IOrderRepository>(
        TYPES.OrderRepository
      );
      const socketService = container.get<ISocketService>(TYPES.SocketService);
      const notificationRepo = container.get<INotificationRepository>(TYPES.NotificationRepository);
      const providerRepo = container.get<IProviderRepository>(TYPES.ProviderRepository)
    
      return new ProviderOrderService(orderRepo,notificationRepo,socketService,providerRepo);
    })
    .inSingletonScope();

  container
    .bind<IProviderOrderController>(TYPES.ProviderOrderController)
    .to(ProviderOrderController)
    .inSingletonScope();
};
