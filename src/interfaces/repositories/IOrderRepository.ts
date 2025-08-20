import { IBaseRepository } from "./IBaseRepository";
import { IOrder } from "../../models/order.model";
import { Types } from "mongoose";
export interface IOrderRepository extends IBaseRepository<IOrder> {
fetchOrders(
  id: Types.ObjectId,
  limit: number,
  page: number
): Promise<{
  orders: IOrder[];
  pagination: {
    totalOrders: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentPage: number;
  };
}>;
fetchAllOrders(
 search: string,
  skip: number,
  limit: number,
  statusFilter: string,
  dateFilter: string,
  startDate?: string | undefined,
  endDate?: string | undefined
): Promise<{ orders: IOrder[]; totalCount: number,totalPages: number }>;
fetchOrderById(orderId: Types.ObjectId): Promise<IOrder | null>;
}
