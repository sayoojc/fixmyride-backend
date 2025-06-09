import { Request, Response } from "express";
import { 
  AddAddressRequestDTO,
  UpdateAddressRequestDTO,
  SetDefaultAddressRequestDTO,
  DeleteAddressRequestSchema,
  DeleteAddressRequestDTO,
  AddressResponseDTO,
  SuccessResponse,
  ErrorResponse,
  SetDefaultAddressSchema,
  UpdateAddressResponseDTO,
  UpdateAddressResponseSchema,
  UpdateAddressRequestSchema,
} from "../../../dtos/controllers/user/userAddress.controller.dto";

export interface IUserAddressController {
  addAddress(
    req: Request<{}, {}, AddAddressRequestDTO>,
    res: Response<AddressResponseDTO | ErrorResponse>
  ): Promise<void>;

  setDefaultAddress(
    req: Request<{},{},SetDefaultAddressRequestDTO>,
    res: Response<SuccessResponse | ErrorResponse>
  ): Promise<void>;

  updateAddress(
    req: Request<{},{},UpdateAddressRequestDTO>,
    res: Response<UpdateAddressResponseDTO | ErrorResponse>
  ): Promise<void>;

  deleteAddress(
    req: Request<{},{},DeleteAddressRequestDTO>,
    res: Response<SuccessResponse | ErrorResponse>
  ): Promise<void>;
}
