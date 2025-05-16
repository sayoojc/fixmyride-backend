import { Request, Response } from "express";

export interface IAdminProviderController {
  /**
   * Fetch all providers with sanitized data.
   */
  fetchProviders(req: Request, res: Response): Promise<void>;

  /**
   * Fetch detailed verification data of a specific provider by ID.
   */
  fetchVerificationData(req: Request, res: Response): Promise<void>;

  /**
   * Fetch a single provider's sanitized data using provider ID.
   */
  fetchProviderById(req: Request, res: Response): Promise<void>;

  /**
   * Verify a provider based on action and admin notes.
   */
  verifyProvider(req: Request, res: Response): Promise<void>;

  /**
   * Toggle provider listing status (block/unblock).
   */
  toggleListing(req: Request, res: Response): Promise<void>;
}
