import { Request, Response } from "express";

export interface IUserBrandController {
  getBrands(req: Request, res: Response): Promise<void>;
}
