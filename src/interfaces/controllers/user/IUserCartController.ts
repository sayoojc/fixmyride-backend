import { Request, Response } from "express";
import {
  AddToCartRequestDTO,
  AddToCartResponseDTO,
  AddVehicleToCartRequestDTO,
  AddVehicleToCartResponseDTO,
  RemoveFromCartResponseDTO,
  RemoveFromCartRequestDTO,
  GetCartRequestDTO,
  GetCartResponseDTO,
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
  removeFromCart(
    req:Request<{},{},RemoveFromCartRequestDTO>,
    res:Response<RemoveFromCartResponseDTO | ErrorResponseDTO>
  ):Promise<void>
  // getCart(
  //   req:Request,
  //   res:Response<GetCartResponseDTO | ErrorResponseDTO>
  // ):Promise<void>
}
