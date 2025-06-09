import { Container } from "inversify";
import { UserBrandController } from "../../../controllers/user/brand.controller";
import { UserBrandService } from "../../../services/user/brand.service";
import { IUserBrandService } from "../../../interfaces/services/user/IUserBrandService";
import { IUserBrandController } from "../../../interfaces/controllers/user/IUserBrandController";
import { IModelRepository } from "../../../interfaces/repositories/IModelRepository";
import { IBrandRepository } from "../../../interfaces/repositories/IBrandRepository";
import { TYPES } from "../../types";

export const bindUserBrandModule = (container: Container) => {
  container
    .bind<IUserBrandService>(TYPES.UserBrandService)
    .toDynamicValue(() => {
      const brandRepo = container.get<IBrandRepository>(TYPES.BrandRepository);
      const modelRepo = container.get<IModelRepository>(TYPES.ModelRepository);
      return new UserBrandService(brandRepo, modelRepo);
    })
    .inSingletonScope();
  container
    .bind<IUserBrandController>(TYPES.UserBrandController)
    .to(UserBrandController)
    .inSingletonScope();
};
