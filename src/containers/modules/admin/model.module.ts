import { Container } from "inversify";
import { AdminModelController } from "../../../controllers/admin/model.controller";
import { AdminModelService } from "../../../services/admin/model.service";
import { IAdminModelController } from "../../../interfaces/controllers/admin/IAdminModelController";
import { IAdminModelService } from "../../../interfaces/services/admin/IAdminModelService";
import { IModelRepository } from "../../../interfaces/repositories/IModelRepository";
import { TYPES } from "../../types";

export const bindAdminModelModule = (container: Container) => {
  container
    .bind<IAdminModelService>(TYPES.AdminModelService)
    .toDynamicValue(() => {
      const modelRepo = container.get<IModelRepository>(TYPES.ModelRepository);
      return new AdminModelService(modelRepo);
    })
    .inSingletonScope();
  container
    .bind<IAdminModelController>(TYPES.AdminModelController)
    .to(AdminModelController)
    .inSingletonScope();
};
