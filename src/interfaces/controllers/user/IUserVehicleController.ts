import { Request, Response } from "express";
import {
  AddVehicleRequestDTO,
  AddVehicleResponseDTO,
  ErrorResponse,
  GetVehicleResponseDTO,
  DeleteVehicleResponseDTO,
  EditVehicleRequestDTO,
  EditVehicleResponseDTO,
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
  deleteVehicle(
    req: Request,
    res: Response<DeleteVehicleResponseDTO | ErrorResponse>
  ): Promise<void>;
  editVehicle(
    req: Request<{}, {}, EditVehicleRequestDTO>,
    res: Response<EditVehicleResponseDTO>
  ): Promise<void>;
}
