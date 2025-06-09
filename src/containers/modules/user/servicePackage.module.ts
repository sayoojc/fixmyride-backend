import { Container } from "inversify";
import { UserServicePackageController } from "../../../controllers/user/servicePackage.controller";
import { UserServicePackageService } from "../../../services/user/servicePackage.service";
import { IUserServicePackageService } from "../../../interfaces/services/user/IUserServicePacakgeService";
import { IUserServicePackageController } from "../../../interfaces/controllers/user/IUserServicePackageController";
import { IServicePackageRepository } from "../../../interfaces/repositories/IServicePackageRepository";
import { TYPES } from "../../types";

export const bindUserServicePackageModule = (container: Container) => {
  container
    .bind<IUserServicePackageService>(TYPES.UserServicePackageService)
    .toDynamicValue(() => {
      const servicePackageRepo = container.get<IServicePackageRepository>(
        TYPES.ServicePackageRepository
      );
      return new UserServicePackageService(servicePackageRepo);
    })
    .inSingletonScope();
  container
    .bind<IUserServicePackageController>(TYPES.UserServicePackageController)
    .to(UserServicePackageController)
    .inSingletonScope();
};
