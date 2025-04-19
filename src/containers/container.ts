import { Container } from "inversify";
import { AuthController } from "../controllers/auth.controller";
import { AdminController } from "../controllers/admin.controller";
import { UserController } from "../controllers/user.controller";
import { AuthService } from "../services/auth.service";
import { MailService } from "../services/mail.service";
import { AdminService } from "../services/admin.service";
import { UserService } from "../services/user.services";
import { MailRepository } from "../repositories/mail.repo";
import { UserRepository } from "../repositories/user.repo";
import { BrandRepository } from "../repositories/brand.repo";

import UserModel from "../models/user.model";
import BrandModel from "../models/brand.model";
import modelModel from "../models/model.model";
import { ModelRepository } from "../repositories/model.repo";



const container = new Container();


container.bind<MailRepository>(MailRepository).toSelf();
container.bind<UserRepository>(UserRepository).toConstantValue(new UserRepository(UserModel));
container.bind<BrandRepository>(BrandRepository).toConstantValue(new BrandRepository(BrandModel))
container.bind<ModelRepository>(ModelRepository).toConstantValue(new ModelRepository(modelModel))




container.bind<MailService>(MailService).toSelf();
container.bind<AuthService>(AuthService).toDynamicValue(() => {
  const userRepo = container.get<UserRepository>(UserRepository);
  return new AuthService(userRepo);
});

container.bind<AdminService>(AdminService).toDynamicValue(() => {
  const userRepo = container.get<UserRepository>(UserRepository);
  const brandRepo = container.get<BrandRepository>(BrandRepository);
  const modelRepo = container.get<ModelRepository>(ModelRepository);
  return new AdminService(userRepo,brandRepo,modelRepo);
});

container.bind<UserService>(UserService).toDynamicValue(() => {
  const userRepo = container.get<UserRepository>(UserRepository);
  const brandRepo = container.get<BrandRepository>(BrandRepository);
  const modelRepo = container.get<ModelRepository>(ModelRepository)
  return new UserService(userRepo,brandRepo,modelRepo);
})


container.bind<AuthController>(AuthController).toSelf();
container.bind<AdminController>(AdminController).toSelf();
container.bind<UserController>(UserController).toSelf();

export default container;
