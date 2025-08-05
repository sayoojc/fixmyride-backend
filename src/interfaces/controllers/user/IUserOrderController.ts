import { Request, Response } from "express";
import { GetOrderDetailsResponseDTO,ErrorResponseDTO } from "../../../dtos/controllers/user/userOrder.controller.dto";

export interface IUserOrderController {
  createRazorpayOrder(req: Request, res: Response): Promise<void>;
  verifyRazorpayPayment(req: Request, res: Response): Promise<void>;
  getOrderDetails(
      req: Request,
      res: Response<GetOrderDetailsResponseDTO | ErrorResponseDTO>
    ): Promise<void>

}