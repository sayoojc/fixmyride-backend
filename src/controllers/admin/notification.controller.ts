import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IAdminNotificationService } from "../../interfaces/services/admin/IAdminNotificationService";
import { IAdminNotificationController } from "../../interfaces/controllers/admin/IAdminNotificationController";
import { FetchNotificationsResponseDTO,ErrorResponseDTO } from "../../dtos/controllers/admin/adminNotificatoin.controller.dto";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";

@injectable()
export class AdminNotificationController implements IAdminNotificationController {
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
    const { search = "", page = "1", limit = "10", statusFilter = "" } = req.query;
    const notifications = await this._adminNotificationService.fetchNotifications(
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

  
}
