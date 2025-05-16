import { Request, Response } from "express";

export interface IAdminAuthController {
  /**
   * Handles admin login
   * @param req - Express Request object
   * @param res - Express Response object
   */
  adminLogin(req: Request, res: Response): Promise<void>;

  /**
   * Handles admin logout
   * @param req - Express Request object
   * @param res - Express Response object
   */
  adminLogout(req: Request, res: Response): Promise<void>;
}
