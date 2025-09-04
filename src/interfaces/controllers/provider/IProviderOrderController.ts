import { Request, Response } from "express";
import {
  GetOrderResponseDTO,
  ErrorResponseDTO,
  UpdateOrderResponseDTO,
} from "../../../dtos/controllers/provider/providerOrder.controller.dto";
export interface IProviderOrderController {
  getOrderData(
    req: Request,
    res: Response<GetOrderResponseDTO | ErrorResponseDTO>
  ): Promise<void>;
  getOrders(
    req: Request,
    res: Response<GetOrderResponseDTO[] | ErrorResponseDTO>
  ): Promise<void>;
  updateOrderStatus(
    req: Request,
    res: Response<UpdateOrderResponseDTO | ErrorResponseDTO>
  ): Promise<void>;
}
