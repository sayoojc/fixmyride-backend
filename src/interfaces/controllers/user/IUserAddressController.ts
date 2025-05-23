import { Request, Response } from "express";
import { 
  AddressResponseDTO, 
  ErrorResponse,
  AddAddressRequestDTO,
  UpdateAddressRequestDTO
} from "../../../dtos/controllers/user/userAddress.controller.dto";

export interface IUserAddressController {
  addAddress(
    req: Request<{}, {}, AddAddressRequestDTO>,
    res: Response<AddressResponseDTO | ErrorResponse>
  ): Promise<void>;

  setDefaultAddress(
    req: Request,
    res: Response
  ): Promise<void>;

  updateAddress(
    req: Request<UpdateAddressRequestDTO>,
    res: Response
  ): Promise<void>;

  deleteAddress(
    req: Request,
    res: Response
  ): Promise<void>;
}
