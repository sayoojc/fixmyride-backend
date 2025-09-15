import { Request, Response } from "express";
import {
  MarkNotificationAsReadResponseDTO,
  MarkNotificationAsUnreadResponseDTO,
  DeleteNotificationResponseDTO,
  markAllAsReadResponseDTO,
} from "../../../dtos/controllers/provider/providerNotification.controller.dto";

export interface IProviderNotificationController {
  getNotifications(req: Request, res: Response): Promise<void>;
  markNotificationAsRead(
    req: Request,
    res: Response<MarkNotificationAsReadResponseDTO>
  ): Promise<void>;
  markNotificationAsUnread(
    req: Request,
    res: Response<MarkNotificationAsUnreadResponseDTO>
  ): Promise<void>;
  deleteNotfication(
    req: Request,
    res: Response<DeleteNotificationResponseDTO>
  ): Promise<void>;
  markAllAsRead(
    req: Request,
    res: Response<markAllAsReadResponseDTO>
  ): Promise<void>;
   getUnreadCount(
   req:Request,
   res:Response
  ): Promise<void>;
}
