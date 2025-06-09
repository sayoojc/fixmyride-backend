import { Request, Response } from "express";
import {
  AddToCartRequestDTO,
  AddToCartResponseDTO,
  AddVehicleToCartRequestDTO,
  AddVehicleToCartResponseDTO,
  ErrorResponseDTO,
} from "../../../dtos/controllers/user/userCart.controller.dto";

export interface IUserCartController {
  addToCart(
    req: Request<{}, {}, AddToCartRequestDTO>,
    res: Response<AddToCartResponseDTO | ErrorResponseDTO>
  ): Promise<void>;

  addVehicleToCart(
    req: Request<{}, {}, AddVehicleToCartRequestDTO>,
    res: Response<AddVehicleToCartResponseDTO | ErrorResponseDTO>
  ): Promise<void>;
}
