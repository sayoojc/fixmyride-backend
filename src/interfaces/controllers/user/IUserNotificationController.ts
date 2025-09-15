import { Request, Response } from "express";
import {
  MarkNotificationAsReadDTO,
  ErrorResponseDTO,
} from "../../../dtos/controllers/user/userNotification.controller.dto";

export interface IUserNotificationController {
  fetchNotifications(req: Request, res: Response): Promise<void>;
  markNotificationAsRead(
    req: Request,
    res: Response<MarkNotificationAsReadDTO | ErrorResponseDTO>
  ): Promise<void>;
  markNotificationAsUnread(req: Request, res: Response): Promise<void>;
  deleteNotification(req: Request, res: Response): Promise<void>;
  markAllAsRead(req: Request, res: Response): Promise<void>;
  getUnreadCount(
    req: Request,
    res: Response<{ success: boolean; message: string; unreadCount: number }>
  ): Promise<void>;
}
