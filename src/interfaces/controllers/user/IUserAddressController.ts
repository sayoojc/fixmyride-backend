import { Request, Response } from "express";
import { 
  AddAddressRequestDTO,
  UpdateAddressRequestDTO,
  SetDefaultAddressRequestDTO,
  GetAddressesResponseDTO,
  DeleteAddressRequestDTO,
  AddressResponseDTO,
  SuccessResponse,
  ErrorResponse,
  UpdateAddressResponseDTO,
} from "../../../dtos/controllers/user/userAddress.controller.dto";

export interface IUserAddressController {
  getAddresses(
    req:Request,
    res:Response<GetAddressesResponseDTO>
  ):Promise<void>
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
