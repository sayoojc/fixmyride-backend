import { Request, Response } from "express";

export interface IAdminBrandController {
  /**
   * Handles the creation of a new brand.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  addBrand(req: Request, res: Response): Promise<void>;

  /**
   * Retrieves all brands.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  getBrands(req: Request, res: Response): Promise<void>;

  /**
   * Toggles the active/inactive status of a brand.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  toggleBrandStatus(req: Request, res: Response): Promise<void>;

  /**
   * Updates an existing brand's name or image.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  updateBrand(req: Request, res: Response): Promise<void>;
}
