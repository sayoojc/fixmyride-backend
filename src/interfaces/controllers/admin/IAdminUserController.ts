import { Request, Response } from "express";

export interface IAdminUserController {
  /**
   * Fetch all users with sanitized data.
   */
  fetchUsers(req: Request, res: Response): Promise<void>;

  /**
   * Toggle the listing (block/unblock) status of a user by email.
   */
  toggleListing(req: Request, res: Response): Promise<void>;
}
