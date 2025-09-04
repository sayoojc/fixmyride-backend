
import { Request, Response } from "express";

export interface IAdminOrderController {

    fetchOrders(req: Request, res: Response): Promise<void>;
    fetchOrderById(req: Request, res: Response): Promise<void>;
    
}

