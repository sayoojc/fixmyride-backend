import { Container } from "inversify";
import { ProviderAuthService } from "../../../services/provider/auth.service";
import { ProviderAuthController } from "../../../controllers/provider/auth.controller";
import { IProviderAuthService } from "../../../interfaces/services/provider/IproviderAuthService";
import { IProviderAuthController } from "../../../interfaces/controllers/provider/IProviderAuthController";
import { TYPES } from "../../types";
import { IProviderRepository } from "../../../interfaces/repositories/IProviderRepository";


export const bindProviderAuthModule = (container: Container) => {
  container
    .bind<IProviderAuthService>(TYPES.ProviderAuthService)
    .toDynamicValue(() => {
      const providerRepo = container.get<IProviderRepository>(
        TYPES.ProviderRepository
      );
      return new ProviderAuthService(providerRepo);
    }).inSingletonScope();
  container
    .bind<IProviderAuthController>(TYPES.ProviderAuthController)
    .to(ProviderAuthController).inSingletonScope();
};
