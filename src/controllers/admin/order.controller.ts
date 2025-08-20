import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IAdminOrderService } from "../../interfaces/services/admin/IAdminOrderService";
import { TYPES } from "../../containers/types";
import { IAdminOrderController } from "../../interfaces/controllers/admin/IAdminOrderController";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";
import {
  FetchOrdersResponseDTO,
  ErrorResponseDTO,
  FetchOrderByIdResponseDTO
} from "../../dtos/controllers/admin/adminOrder.cotroller.dto";

@injectable()
export class AdminOrderController implements IAdminOrderController {
  constructor(
    @inject(TYPES.AdminOrderService)
    private readonly _adminOrderService: IAdminOrderService
  ) {}

async fetchOrders(
  req: Request,
  res: Response<FetchOrdersResponseDTO | ErrorResponseDTO>
): Promise<void> {
  try {
    const search = (req.query.search as string) || "";
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;
    const statusFilter = (req.query.statusFilter as string) || "";
    const dateFilter = (req.query.dateFilter as string) || "";
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    console.log("Fetch Orders Request:", {
      search,
      page,
      limit,
      statusFilter,
      dateFilter,
      startDate,
      endDate,
    });
    const { sanitizedOrders, totalCount,totalPages } = await this._adminOrderService.fetchOrders(
      search,
      skip,
      limit,
      statusFilter,
      dateFilter,
      startDate,
      endDate,
    );

    const response: FetchOrdersResponseDTO = {
      success: true,
      message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Orders"),
      orders:sanitizedOrders,
      totalCount,
      totalPages,
    };
    res.status(StatusCode.OK).json(response);
  } catch (error) {
    console.error("Error in fetchOrders controller:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
}
async fetchOrderById(
  req: Request,
  res: Response<FetchOrderByIdResponseDTO | ErrorResponseDTO>
): Promise<void> {
  try {
    const orderId = req.params.id;
    console.log("Fetch Order By ID Request:", { orderId });

    const order = await this._adminOrderService.fetchOrderById(orderId);
    if (!order) {
       res.status(StatusCode.NOT_FOUND).json({
        success: false,
        message: RESPONSE_MESSAGES.RESOURCE_NOT_FOUND("Order"),
      });
      return
    }

    const response = {
      success: true,
      message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Order"),
      order: order, // Wrap in an array for consistency
      totalCount: 1,
      totalPages: 1,
    };
    res.status(StatusCode.OK).json(response);
  } catch (error) {
    console.error("Error in fetchOrderById controller:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
}
}
