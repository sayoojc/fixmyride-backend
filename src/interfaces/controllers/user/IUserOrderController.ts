import { Request, Response } from "express";

export interface IUserOrderController {
  createRazorpayOrder(req: Request, res: Response): Promise<void>;
  verifyRazorpayPayment(req: Request, res: Response): Promise<void>;

}