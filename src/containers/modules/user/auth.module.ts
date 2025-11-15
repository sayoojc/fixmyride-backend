import { Container } from "inversify";
import { UserAuthController } from "../../../controllers/user/auth.controller";
import { UserAuthService } from "../../../services/user/auth.services";
import { IUserAuthController } from "../../../interfaces/controllers/user/IUserAuthController";
import { IUserAuthService } from "../../../interfaces/services/user/IUserAuthService";
import { IUserRepository } from "../../../interfaces/repositories/IUserRepository";
import { TYPES } from "../../types";


export const bindUserAuthModule = (container: Container) => {
  container
    .bind<IUserAuthService>(TYPES.UserAuthService)
    .toDynamicValue(() => {
      const userRepo = container.get<IUserRepository>(TYPES.UserRepository);
      return new UserAuthService(userRepo);
    })
    .inSingletonScope();
  container
    .bind<IUserAuthController>(TYPES.UserAuthController)
    .to(UserAuthController)
    .inSingletonScope();
};
