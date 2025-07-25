import { Container } from "inversify";
import { TYPES } from "../../types";

import { ProviderOrderController } from "../../../controllers/provider/order.controller";
import { ProviderOrderService } from "../../../services/provider/order.service";
import { IProviderOrderController } from "../../../interfaces/controllers/provider/IProviderOrderController";
import { IProviderOrderService } from "../../../interfaces/services/provider/IProviderOrderService";
import { IOrderRepository } from "../../../interfaces/repositories/IOrderRepository";

export const bindProviderOrderModule = (container: Container) => {
  container
    .bind<IProviderOrderService>(TYPES.ProviderOrderService)
    .toDynamicValue(() => {
      const orderRepo = container.get<IOrderRepository>(
        TYPES.OrderRepository
      );
    
      return new ProviderOrderService(orderRepo);
    })
    .inSingletonScope();

  container
    .bind<IProviderOrderController>(TYPES.ProviderOrderController)
    .to(ProviderOrderController)
    .inSingletonScope();
};
