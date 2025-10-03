import { Request, Response } from "express";
import {
  GetOrderDetailsResponseDTO,
  ErrorResponseDTO,
  GetOrderHistoryResponseDTO,
  PlaceCashOrderRequestDTO,

} from "../../../dtos/controllers/user/userOrder.controller.dto";

export interface IUserOrderController {
  createRazorpayOrder(req: Request, res: Response): Promise<void>;
  verifyRazorpayPayment(req: Request, res: Response): Promise<void>;
  getOrderDetails(
    req: Request,
    res: Response<GetOrderDetailsResponseDTO | ErrorResponseDTO>
  ): Promise<void>;
  getOrderHistory(
    req: Request,
    res: Response<GetOrderHistoryResponseDTO | ErrorResponseDTO>
  ): Promise<void>;
  placeCashOrder(
    req: Request<{},{},PlaceCashOrderRequestDTO>,
    res: Response
  ): Promise<void>
   placeEmergencyCashOrder(
  req: Request,
  res: Response
): Promise<void>
 
}
