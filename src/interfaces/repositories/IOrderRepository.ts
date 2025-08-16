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
}
