import { Container } from "inversify";
import { AdminBrandService } from "../../../services/admin/brand.service";
import { AdminBrandController } from "../../../controllers/admin/brand.controller";
import { BrandRepository } from "../../../repositories/brand.repo";
import { ModelRepository } from "../../../repositories/model.repo";
import brandModel from "../../../models/brand.model";
import modelModel from "../../../models/model.model";
import { IAdminBrandController } from "../../../interfaces/controllers/admin/IAdminBrandController";
import { IAdminBrandService } from "../../../interfaces/services/admin/IAdminBrandService";
import { IModelRepository } from "../../../interfaces/repositories/IModelRepository";
import { IBrandRepository } from "../../../interfaces/repositories/IBrandRepository";
import { TYPES } from "../../types";


export const bindAdminBrandModule = (container: Container) => {
  container
    .bind<IBrandRepository>(TYPES.BrandRepository)
    .toDynamicValue(() => new BrandRepository(brandModel))
    .inSingletonScope();

  container
    .bind<IModelRepository>(TYPES.ModelRepository)
    .toDynamicValue(() => new ModelRepository(modelModel))
    .inSingletonScope();

  container
    .bind<IAdminBrandService>(TYPES.AdminBrandService)
    .toDynamicValue(() => {
      const brandRepo = container.get<IBrandRepository>(TYPES.BrandRepository);
      const modelRepo = container.get<IModelRepository>(TYPES.ModelRepository);
      return new AdminBrandService(brandRepo, modelRepo);
    });

  container
    .bind<IAdminBrandController>(TYPES.AdminBrandController)
    .to(AdminBrandController);
};
