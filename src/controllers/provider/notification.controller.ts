import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IProviderNotificationService } from "../../interfaces/services/provider/IProviderNotificationsService";
import { IProviderNotificationController } from "../../interfaces/controllers/provider/IProviderNotificationController";
import { TYPES } from "../../containers/types";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";
import mongoose from "mongoose";
import {
  GetNotificationsResponse,
  getNotificationsSuccessSchema,
  MarkNotificationAsReadResponseDTO,
  markNotificationAsReadResponseSchema,
  markNotificationAsUnreadResponseSchema,
  MarkNotificationAsUnreadResponseDTO,
  deleteNotificationResponseSchema,
  DeleteNotificationResponseDTO,
  markAllAsReadResponseDTO,
  markAllAsReadResponseSchema,
} from "../../dtos/controllers/provider/providerNotification.controller.dto";
@injectable()
export class ProviderNotificationController
  implements IProviderNotificationController
{
  constructor(
    @inject(TYPES.ProviderNotificationService)
    private readonly _providerNotificationService: IProviderNotificationService
  ) {}
  async getNotifications(
    req: Request,
    res: Response<GetNotificationsResponse>
  ): Promise<void> {
    try {
      const token = req.cookies?.accessToken;
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;
      const search =
        typeof req.query.search === "string" ? req.query.search : "";
      const page =
        typeof req.query.page === "string" ? parseInt(req.query.page) : 1;
      const filter =
        typeof req.query.filter === "string" ? req.query.filter : "all";
      const itemsPerPage =
        typeof req.query.itemsPerPage === "string"
          ? parseInt(req.query.itemsPerPage)
          : 10;
      const unreadOnly =
        typeof req.query.unreadOnly === "string"
          ? req.query.unreadOnly === "true"
          : false;
      const providerId = decoded.id;
      console.log("the decoded id", providerId);
      const { refinedNotifications, totalPages,unreadCount } =
        await this._providerNotificationService.getNotifications(
          providerId,
          search,
          page,
          filter,
          itemsPerPage,
          unreadOnly
        );
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Notifications"),
        notifications: refinedNotifications,
        totalPages,
        unreadCount
      };
      const validate = getNotificationsSuccessSchema.safeParse(response);
      if (!validate.success) {
        console.log(
          "tje response validateion of the notification fetch is failed"
        );
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async markNotificationAsRead(
    req: Request,
    res: Response<MarkNotificationAsReadResponseDTO>
  ): Promise<void> {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("the order id provided is not valid");
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      const result =
        await this._providerNotificationService.markNotificationAsRead(id);
      if (!result.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Notification"),
      };
      const validate = markNotificationAsReadResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async markNotificationAsUnread(
    req: Request,
    res: Response<MarkNotificationAsUnreadResponseDTO>
  ): Promise<void> {
    try {
      console.log("the mark notification as unread controller function");
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("the order id provided is not valid");
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      const result =
        await this._providerNotificationService.markNotificationAsUnread(id);
      if (!result.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Notification"),
      };
      const validate =
        markNotificationAsUnreadResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async deleteNotfication(
    req: Request,
    res: Response<DeleteNotificationResponseDTO>
  ): Promise<void> {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("the order id provided is not valid");
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      console.log("the notification id", id);
      const success =
        await this._providerNotificationService.deleteNotification(id);
      if (!success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_DELETED("notification"),
      };
      const validate = deleteNotificationResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      if (success) {
        res.status(StatusCode.OK).json(response);
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async markAllAsRead(
    req: Request,
    res: Response<markAllAsReadResponseDTO>
  ): Promise<void> {
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        res
          .status(StatusCode.UNAUTHORIZED)
          .json({ success: false, message: RESPONSE_MESSAGES.UNAUTHORIZED });
        return;
      }
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user) {
        res
          .status(StatusCode.UNAUTHORIZED)
          .json({ success: false, message: RESPONSE_MESSAGES.UNAUTHORIZED });
      }
      const result = this._providerNotificationService.markAllAsRead(user.id);
      if (!result) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({
            success: false,
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          });
        return;
      }
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.ACTION_SUCCESS,
      };
      const validate = markAllAsReadResponseSchema.safeParse(response);
      if (!validate.success) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({
            success: false,
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      return;
    }
  }
}
