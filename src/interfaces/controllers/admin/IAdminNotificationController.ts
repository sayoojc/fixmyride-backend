import { Request, Response } from "express";
import {
  MarkNotificationAsReadDTO,
  ErrorResponseDTO,
} from "../../../dtos/controllers/admin/adminNotificatoin.controller.dto";
export interface IAdminNotificationController {
  fetchNotifications(req: Request, res: Response): Promise<void>;
  markNotificationAsRead(
    req: Request,
    res: Response<MarkNotificationAsReadDTO | ErrorResponseDTO>
  ): Promise<void>;
  markNotificationAsUnread(req: Request, res: Response): Promise<void>;
  deleteNotification(
    req: Request,
    res: Response
  ): Promise<void>
 markAllAsRead(req: Request, res: Response): Promise<void>
}
