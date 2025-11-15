import { Container } from "inversify";
import { TYPES } from "../../types";
import { UserProviderController } from "../../../controllers/user/provider.controller";
import { UserProviderService } from "../../../services/user/provider.service";
import { IUserProviderController } from "../../../interfaces/controllers/user/IUserProviderController";
import { IUserProviderService } from "../../../interfaces/services/user/IUserProviderService";
import { IProviderRepository } from "../../../interfaces/repositories/IProviderRepository";
import { ICityRepository } from "../../../interfaces/repositories/ICityRepository";

export const bindUserProviderModule = (container: Container) => {
  container
    .bind<IUserProviderService>(TYPES.UserProviderService)
    .toDynamicValue(() => {
      const providerRepo = container.get<IProviderRepository>(TYPES.ProviderRepository);
      const cityRepo = container.get<ICityRepository>(TYPES.CityRepository)
      return new UserProviderService(providerRepo,cityRepo);
    })
    .inSingletonScope();
  container
    .bind<IUserProviderController>(TYPES.UserProviderController)
    .to(UserProviderController)
    .inSingletonScope();
};
