import { Container } from "inversify";
import { UserCartController } from "../../../controllers/user/cart.controller";
import { UserCartService } from "../../../services/user/cart.service";
import { IUserCartController } from "../../../interfaces/controllers/user/IUserCartController";
import { IUserCartService } from "../../../interfaces/services/user/IUserCartService";
import { ICartRepository } from "../../../interfaces/repositories/ICartRepository";
import { TYPES } from "../../types";

export const bindUserCartModule = (container: Container) => {
  container
    .bind<IUserCartService>(TYPES.UserCartService)
    .toDynamicValue(() => {
      const cartRepo = container.get<ICartRepository>(TYPES.CartRepository);
      return new UserCartService(cartRepo);
    })
    .inSingletonScope();
  container
    .bind<IUserCartController>(TYPES.UserCartController)
    .to(UserCartController)
    .inSingletonScope();
};
