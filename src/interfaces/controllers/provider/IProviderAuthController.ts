import { Request, Response } from "express";

export interface IProviderAuthController {
  providerRegisterTemp(req: Request, res: Response): Promise<void>;
  providerRegister(req: Request, res: Response): Promise<void>;
  providerLogin(req: Request, res: Response): Promise<void>;
  providerLogout(req: Request, res: Response): Promise<void>;
}
