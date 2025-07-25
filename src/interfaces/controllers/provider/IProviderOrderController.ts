import { Request,Response } from "express";
import { GetOrderResponseDTO,ErrorResponseDTO } from "../../../dtos/controllers/provider/providerOrder.controller.dto";
export interface IProviderOrderController {
    getOrderData(req:Request,res:Response<GetOrderResponseDTO | ErrorResponseDTO>):Promise<void>
}