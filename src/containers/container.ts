import { Container } from "inversify";
import { AuthController } from "../controllers/auth.controller";
import { AdminController } from "../controllers/admin.controller";
import { AuthService } from "../services/auth.service";
import { MailService } from "../services/mail.service";
import { AdminService } from "../services/admin.service";
import { MailRepository } from "../repositories/mail.repo";
import { UserRepository } from "../repositories/user.repo";
import { TempUserRepository } from "../repositories/tempUser.repo";
import { RefreshTokenRepository } from "../repositories/refreshToken.repo";

import TempUserModel from "../models/tempUser.model";
import UserModel from "../models/user.model";
import RefreshTokenModel from "../models/refreshToken.model";


const container = new Container();


container.bind<MailRepository>(MailRepository).toSelf();
container.bind<UserRepository>(UserRepository).toConstantValue(new UserRepository(UserModel));
container.bind<TempUserRepository>(TempUserRepository).toConstantValue(new TempUserRepository(TempUserModel));
container.bind<RefreshTokenRepository>(RefreshTokenRepository).toConstantValue(new RefreshTokenRepository(RefreshTokenModel));


container.bind<MailService>(MailService).toSelf();
container.bind<AuthService>(AuthService).toDynamicValue(() => {
  const userRepo = container.get<UserRepository>(UserRepository);
  const tempUserRepo = container.get<TempUserRepository>(TempUserRepository);
  const refreshTokenRepo = container.get<RefreshTokenRepository>(RefreshTokenRepository)
  return new AuthService(userRepo, tempUserRepo,refreshTokenRepo);
});

container.bind<AdminService>(AdminService).toDynamicValue(() => {
  const userRepo = container.get<UserRepository>(UserRepository);
  return new AdminService(userRepo);
});


container.bind<AuthController>(AuthController).toSelf();
container.bind<AdminController>(AdminController).toSelf();

export default container;
