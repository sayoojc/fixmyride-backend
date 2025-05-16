import { Request, Response } from "express";

export interface IAdminModelController {
  /**
   * Handles creation of a new vehicle model.
   * @param req - Express Request object containing model details
   * @param res - Express Response object to return the result
   */
  addModel(req: Request, res: Response): Promise<void>;

  /**
   * Toggles the active/inactive status of a vehicle model.
   * @param req - Express Request object with model/brand IDs and new status
   * @param res - Express Response object to return the result
   */
  toggleModelStatus(req: Request, res: Response): Promise<void>;

  /**
   * Updates an existing vehicle model's name and image.
   * @param req - Express Request object with updated model details
   * @param res - Express Response object to return the result
   */
  updateModel(req: Request, res: Response): Promise<void>;
}
