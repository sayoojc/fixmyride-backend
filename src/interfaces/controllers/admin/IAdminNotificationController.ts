import { Request, Response } from "express";

export interface IAdminNotificationController {
 
fetchNotifications(
  req: Request,
  res: Response
): Promise<void>;

}
