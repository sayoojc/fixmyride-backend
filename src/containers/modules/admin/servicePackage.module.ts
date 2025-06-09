import { Container } from "inversify";
import { AdminServicePackageController } from "../../../controllers/admin/servicePackage.controller";
import { AdminServicePackageService } from "../../../services/admin/servicePackage.service";
import { IAdminServicePackageService } from "../../../interfaces/services/admin/IAdminServicePackageService";
import { IAdminServicePackageController } from "../../../interfaces/controllers/admin/IAdminServicePackageController";
import { IServicePackageRepository } from "../../../interfaces/repositories/IServicePackageRepository";
import { TYPES } from "../../types";

export const bindAdminServicePackageModule = (container: Container) => {
  container
    .bind<IAdminServicePackageService>(TYPES.AdminServicePackageService)
    .toDynamicValue(() => {
      const servicePackageRepo = container.get<IServicePackageRepository>(
        TYPES.ServicePackageRepository
      );
      return new AdminServicePackageService(servicePackageRepo);
    })
    .inSingletonScope();
  container
    .bind<IAdminServicePackageController>(TYPES.AdminServicePackageController)
    .to(AdminServicePackageController)
    .inSingletonScope();
};
