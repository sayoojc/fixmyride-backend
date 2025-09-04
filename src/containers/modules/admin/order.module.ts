import { Container } from "inversify";
import { AdminOrderController } from "../../../controllers/admin/order.controller";
import { AdminOrderService } from "../../../services/admin/order.service"; 
import { IAdminOrderService } from "../../../interfaces/services/admin/IAdminOrderService";
import { IAdminOrderController } from "../../../interfaces/controllers/admin/IAdminOrderController";
import { IOrderRepository } from "../../../interfaces/repositories/IOrderRepository";
import { TYPES } from "../../types";

export const bindAdminOrderModule = (container: Container) => {
  container
    .bind<IAdminOrderService>(TYPES.AdminOrderService)
    .toDynamicValue(() => {
      const orderRepo = container.get<IOrderRepository>(TYPES.OrderRepository);
      return new AdminOrderService(orderRepo);
    })
    .inSingletonScope();
  container
    .bind<IAdminOrderController>(TYPES.AdminOrderController)
    .to(AdminOrderController)
    .inSingletonScope();
};
