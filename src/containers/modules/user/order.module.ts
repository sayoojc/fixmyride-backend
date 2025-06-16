import { Container } from "inversify";
import { IUserOrderController } from "../../../interfaces/controllers/user/IUserOrderController";
import { UserOrderService } from "../../../services/user/order.service";
import { IOrderRepository } from "../../../interfaces/repositories/IOrderRepository";
import { IUserOrderService } from "../../../interfaces/services/user/IUserOrderService";4
import { UserOrderController } from "../../../controllers/user/orderController";
import { TYPES } from "../../types";
import { ICartRepository } from "../../../interfaces/repositories/ICartRepository";

export const bindUserOrderModule = (container: Container) => {
  container
    .bind<IUserOrderService>(TYPES.UserOrderService)
    .toDynamicValue(() => {
      const orderRepo = container.get<IOrderRepository>(TYPES.OrderRepository);
      const cartRepo = container.get<ICartRepository>(TYPES.CartRepository);

      return new UserOrderService(orderRepo,cartRepo);
    })
    .inSingletonScope();
  container
    .bind<IUserOrderController>(TYPES.UserOrderController)
    .to(UserOrderController)
    .inSingletonScope();
};
