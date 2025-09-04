import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IAdminNotificationService } from "../../interfaces/services/admin/IAdminNotificationService";
import { IAdminNotificationController } from "../../interfaces/controllers/admin/IAdminNotificationController";
import {
  FetchNotificationsResponseDTO,
  ErrorResponseDTO,
  MarkNotificationAsReadDTO,
  MarkNotificationAsReadSchema,
} from "../../dtos/controllers/admin/adminNotificatoin.controller.dto";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";

@injectable()
export class AdminNotificationController
  implements IAdminNotificationController
{
  constructor(
    @inject(TYPES.AdminNotificationService)
    private readonly _adminNotificationService: IAdminNotificationService
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
        await this._adminNotificationService.fetchNotifications(
          id,
          String(search),
          Number(page),
          Number(limit),
          String(statusFilter)
        );
      res.status(StatusCode.OK).json({
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Notifications"),
        notifications: notifications.data,
        totalCount: notifications.total,
        totalPages: Number(Math.ceil(notifications.total / Number(limit))),
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
        await this._adminNotificationService.markNotificationAsRead(id);
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
        await this._adminNotificationService.markNotificationAsUnread(id);
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

      const deleted = await this._adminNotificationService.deleteNotification(
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

      const updated = await this._adminNotificationService.markAllAsRead(id);

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
      throw error;
    }
  }
}
