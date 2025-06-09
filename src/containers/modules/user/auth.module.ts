import { Container } from "inversify";
import { UserAuthController } from "../../../controllers/user/auth.controller";
import { UserAuthService } from "../../../services/user/auth.services";
import { UserRepository } from "../../../repositories/user.repo";
import userModel from "../../../models/user.model";
import { IUserAuthController } from "../../../interfaces/controllers/user/IUserAuthController";
import { IUserAuthService } from "../../../interfaces/services/user/IUserAuthService";
import { IUserRepository } from "../../../interfaces/repositories/IUserRepository";
import { TYPES } from "../../types";
import { IMailService } from "../../../interfaces/services/IMailService";
import { IMailRepository } from "../../../interfaces/repositories/IMailRepository";
import { MailService } from "../../../services/mail.service";
import { MailRepository } from "../../../repositories/mail.repo";

export const bindUserAuthModule = (container: Container) => {
  container
    .bind<IUserAuthService>(TYPES.UserAuthService)
    .toDynamicValue(() => {
      const userRepo = container.get<IUserRepository>(TYPES.UserRepository);
      return new UserAuthService(userRepo);
    })
    .inSingletonScope();
  container
    .bind<IUserAuthController>(TYPES.UserAuthController)
    .to(UserAuthController)
    .inSingletonScope();
};
