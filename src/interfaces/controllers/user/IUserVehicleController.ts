import { Request, Response } from "express";
import {
  AddVehicleRequestDTO,
  AddVehicleResponseDTO,
  ErrorResponse,
  GetVehicleResponseDTO,
} from "../../../dtos/controllers/user/userVehicle.controller.dto";

export interface IUserVehicleController {
  addVehicle(
    req: Request<{}, {}, AddVehicleRequestDTO>,
    res: Response<AddVehicleResponseDTO | ErrorResponse>
  ): Promise<void>;
  getVehicle(
    req: Request,
    res: Response<GetVehicleResponseDTO | ErrorResponse>
  ): Promise<void>;
}
