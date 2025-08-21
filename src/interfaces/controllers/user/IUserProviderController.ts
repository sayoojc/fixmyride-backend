import { Request, Response } from "express";
import {
  IFetchProviderResponseDTO,
  ErrorResposnseDTO,
} from "../../../dtos/controllers/user/userProvider.controller.dto";

export interface IUserProviderController {
  getProviders(
    req: Request,
    res: Response<IFetchProviderResponseDTO | ErrorResposnseDTO>
  ): Promise<void>;
}
