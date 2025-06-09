import { Container } from "inversify";
import { AdminAuthController } from "../../../controllers/admin/auth.controller";
import { AdminAuthService } from "../../../services/admin/auth.services";
import { IAdminAuthController } from "../../../interfaces/controllers/admin/IAdminAuthController";
import { IAdminAuthService } from "../../../interfaces/services/admin/IAdminAuthService";
import { IUserRepository } from "../../../interfaces/repositories/IUserRepository";
import { TYPES } from "../../types";

export const bindAdminAuthModule = (container: Container) => {
  container
    .bind<IAdminAuthService>(TYPES.AdminAuthService)
    .toDynamicValue(() => {
      const userRepo = container.get<IUserRepository>(TYPES.UserRepository);
      return new AdminAuthService(userRepo);
    })
    .inSingletonScope();
  container
    .bind<IAdminAuthController>(TYPES.AdminAuthController)
    .to(AdminAuthController)
    .inSingletonScope();
};
