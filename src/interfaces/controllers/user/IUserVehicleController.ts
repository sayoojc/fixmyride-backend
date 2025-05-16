import { Request, Response } from "express";

export interface IUserVehicleController {
  addVehicle(req: Request, res: Response): Promise<void>;
}
