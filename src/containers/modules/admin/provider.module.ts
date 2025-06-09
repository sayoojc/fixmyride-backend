import { Container } from "inversify";
import { AdminProviderController } from "../../../controllers/admin/provider.controller";
import { AdminProviderService } from "../../../services/admin/provider.service";
import { IMailService } from "../../../interfaces/services/IMailService";
import { IAdminProviderController } from "../../../interfaces/controllers/admin/IAdminProviderController";
import { IAdminProviderService } from "../../../interfaces/services/admin/IAdminProviderService";
import { IVerificationRepository } from "../../../interfaces/repositories/IVerificationRepository";
import { IProviderRepository } from "../../../interfaces/repositories/IProviderRepository";
import { TYPES } from "../../types";

export const bindAdminProviderModule = (container: Container) => {
  container
    .bind<IAdminProviderService>(TYPES.AdminProviderService)
    .toDynamicValue(() => {
      const providerRepo = container.get<IProviderRepository>(
        TYPES.ProviderRepository
      );
      const verificationRepo = container.get<IVerificationRepository>(
        TYPES.VerificationRepository
      );
      const mailService = container.get<IMailService>(TYPES.MailService);
      return new AdminProviderService(
        providerRepo,
        verificationRepo,
        mailService
      );
    });
  container
    .bind<IAdminProviderController>(TYPES.AdminProviderController)
    .to(AdminProviderController);
};
