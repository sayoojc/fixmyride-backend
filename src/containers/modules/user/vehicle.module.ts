import { Container } from "inversify";
import { TYPES } from "../../types";

import { UserVehicleController } from "../../../controllers/user/vehicle.controller";
import { UserVehicleService } from "../../../services/user/vehicle.service";

import { IUserVehicleController } from "../../../interfaces/controllers/user/IUserVehicleController";
import { IUserVehicleService } from "../../../interfaces/services/user/IUserVehicleService";
import { IVehicleRepository } from "../../../interfaces/repositories/IVehicleRepository";

export const bindUserVehicleModule = (container: Container) => {
  container
    .bind<IUserVehicleService>(TYPES.UserVehicleService)
    .toDynamicValue(() => {
      const vehicleRepo = container.get<IVehicleRepository>(TYPES.VehicleRepository);
      return new UserVehicleService(vehicleRepo);
    })
    .inSingletonScope();

  container
    .bind<IUserVehicleController>(TYPES.UserVehicleController)
    .to(UserVehicleController)
    .inSingletonScope();
};
