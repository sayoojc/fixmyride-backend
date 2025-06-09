import { Container } from "inversify";
import { AdminUserController } from "../../../controllers/admin/user.controller";
import { AdminUserService } from "../../../services/admin/user.service";
import { IAdminUserService } from "../../../interfaces/services/admin/IAdminUserService";
import { IAdminUserController } from "../../../interfaces/controllers/admin/IAdminUserController";
import { IUserRepository } from "../../../interfaces/repositories/IUserRepository";
import { TYPES } from "../../types";

export const bindAdminUserModule = (container: Container) => {
  container
    .bind<IAdminUserService>(TYPES.AdminUserService)
    .toDynamicValue(() => {
      const userRepo = container.get<IUserRepository>(TYPES.UserRepository);
      return new AdminUserService(userRepo);
    })
    .inSingletonScope();
  container
    .bind<IAdminUserController>(TYPES.AdminUserController)
    .to(AdminUserController)
    .inSingletonScope();
};
