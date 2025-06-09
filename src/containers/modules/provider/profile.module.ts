import { Container } from "inversify";
import { TYPES } from "../../types";

import { ProviderProfileController } from "../../../controllers/provider/profile.controller";
import { ProviderProfileService } from "../../../services/provider/profile.service";
import { IProviderProfileController } from "../../../interfaces/controllers/provider/IProviderProfileController";
import { IProviderProfileService } from "../../../interfaces/services/provider/IProviderProfileService";
import { IProviderRepository } from "../../../interfaces/repositories/IProviderRepository";
import { IVerificationRepository } from "../../../interfaces/repositories/IVerificationRepository";

export const bindProviderProfileModule = (container: Container) => {
  container
    .bind<IProviderProfileService>(TYPES.ProviderProfileService)
    .toDynamicValue(() => {
      const providerRepo = container.get<IProviderRepository>(
        TYPES.ProviderRepository
      );
      const verificationRepo = container.get<IVerificationRepository>(
        TYPES.VerificationRepository
      );
      return new ProviderProfileService(providerRepo, verificationRepo);
    })
    .inSingletonScope();

  container
    .bind<IProviderProfileController>(TYPES.ProviderProfileController)
    .to(ProviderProfileController)
    .inSingletonScope();
};
