import { Request, Response } from "express";

export interface IUserAuthController {
  registerTemp(req: Request, res: Response): Promise<void>;
  register(req: Request, res: Response): Promise<void>;
  userLogin(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
  forgotPassword(req: Request, res: Response): Promise<void>;
  resetPassword(req: Request, res: Response): Promise<void>;
}
