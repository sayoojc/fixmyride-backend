import { Request, Response } from "express";

export interface IAdminUserController {

  fetchUsers(req: Request, res: Response): Promise<void>;

  toggleListing(req: Request, res: Response): Promise<void>;
}
