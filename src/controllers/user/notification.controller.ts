import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IUserNotificationService } from "../../interfaces/services/user/IUserNotificationService";
import { IUserNotificationController } from "../../interfaces/controllers/user/IUserNotificationController";
import {
  FetchNotificationsResponseDTO,
  ErrorResponseDTO,
  MarkNotificationAsReadDTO,
  MarkNotificationAsReadSchema,
} from "../../dtos/controllers/user/userNotification.controller.dto";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";

@injectable()
export class UserNotificationController
  implements IUserNotificationController
{
  constructor(
    @inject(TYPES.UserNotificationService)
    private readonly _userNotificationService: IUserNotificationService
  ) {}
  async fetchNotifications(
    req: Request,
    res: Response<FetchNotificationsResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const id = req.userData?.id;
      if (!id) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      const {
        search = "",
        page = "1",
        limit = "10",
        statusFilter = "",
      } = req.query;
      const notifications =
        await this._userNotificationService.fetchNotifications(
          id,
          String(search),
          Number(page),
          Number(limit),
          String(statusFilter)
        );
      res.status(StatusCode.OK).json({
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Notifications"),
        ...notifications,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async markNotificationAsRead(
    req: Request,
    res: Response<MarkNotificationAsReadDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const id = req.params.id;
      const notificationDoc =
        await this._userNotificationService.markNotificationAsRead(id);
      if (!notificationDoc) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: RESPONSE_MESSAGES.RESOURCE_NOT_FOUND("notification"),
        });
        return;
      }
      const notification = {
        ...notificationDoc.toObject(),
        _id: notificationDoc._id.toString(),
        recipientId: notificationDoc.recipientId.toString(),
        createdAt: notificationDoc.createdAt.toISOString(),
      };
      console.log("the notification after marking it as read", notification);
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("notification"),
        notification,
      };
      const validate = MarkNotificationAsReadSchema.safeParse(response);
      if (!validate.success) {
        console.log(
          "the notification validation failed",
          validate.error.message
        );
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : String(error) || RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async markNotificationAsUnread(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const notificationDoc =
        await this._userNotificationService.markNotificationAsUnread(id);
      if (!notificationDoc) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: RESPONSE_MESSAGES.RESOURCE_NOT_FOUND("notification"),
        });
        return;
      }
      const notification = {
        ...notificationDoc.toObject(),
        _id: notificationDoc._id.toString(),
        recipientId: notificationDoc.recipientId.toString(),
        createdAt: notificationDoc.createdAt.toISOString(),
      };
      console.log("the notification after marking it as unread", notification);
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("notification"),
        notification,
      };
      const validate = MarkNotificationAsReadSchema.safeParse(response);
      if (!validate.success) {
        console.log(
          "the notification marking as unread validation failed",
          validate.error.message
        );
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      console.error("Error marking notification as unread:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : String(error) || RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      const deleted = await this._userNotificationService.deleteNotification(
        id
      );

      if (!deleted) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: RESPONSE_MESSAGES.RESOURCE_NOT_FOUND("notification"),
        });
        return;
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_DELETED("notification"),
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : String(error) || RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const id = req.userData?.id;
      if (!id) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      const updated = await this._userNotificationService.markAllAsRead(id);
      if (!updated) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: RESPONSE_MESSAGES.RESOURCE_NOT_FOUND("notifications"),
        });
        return;
      }
      res.status(StatusCode.OK).json({
        success: true,
        message: RESPONSE_MESSAGES.NOTIFICATIONS_MARKED_AS_READ,
      });
    } catch (error) {
           res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : String(error) || RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  } 
 async getUnreadCount(
    req: Request,
    res: Response<{ success: boolean; message: string; unreadCount: number }>
  ): Promise<void> {
    try {
      const providerId = req.userData?.id;
      if (!providerId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
          unreadCount: 0,
        });
        return;
      }
      const unreadCount =
        await this._userNotificationService.getUnreadCount(providerId);
      res.status(StatusCode.OK).json({
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Notification counts"),
        unreadCount,
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        unreadCount: 0,
      });
    }
  }
}
