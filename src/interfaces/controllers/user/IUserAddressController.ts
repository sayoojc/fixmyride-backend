import { Request, Response } from "express";

export interface IUserAddressController {
  addAddress(req: Request, res: Response): Promise<void>;
  setDefaultAddress(req: Request, res: Response): Promise<void>;
  updateAddress(req: Request, res: Response): Promise<void>;
  deleteAddress(req: Request, res: Response): Promise<void>;
}
