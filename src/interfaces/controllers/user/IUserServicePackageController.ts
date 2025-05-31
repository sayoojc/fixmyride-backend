import { Request, Response } from "express";

export interface IUserServicePackageController {
  getServicePackages(req: Request, res: Response): Promise<void>;
}
