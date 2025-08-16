import { BaseRepository } from "./base/base.repo";
import {IOrder} from '../models/order.model'
import { Model as MongooseModel, Types } from "mongoose";
import { IOrderRepository } from "../interfaces/repositories/IOrderRepository";
export class OrderRepository extends BaseRepository<IOrder> implements IOrderRepository {
  constructor(orderModel: MongooseModel<IOrder>) {
    super(orderModel);
  }
async fetchOrders(
  id: Types.ObjectId,
  limit: number,
  page: number
): Promise<{ orders: IOrder[]; pagination: {totalOrders:number,totalPages:number,hasNextPage:boolean,hasPrevPage:boolean,currentPage:number} }> {
  try {
    const totalOrders = await this.model.countDocuments({ "user._id": id });
    const totalPages = Math.ceil(totalOrders / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const orders = await this.model
      .find({ "user._id": id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      orders,
      pagination: {
        totalOrders,
        totalPages,
        hasNextPage,
        hasPrevPage,
        currentPage: page,
      },
    };
  } catch (error) {
    throw error;
  }
}

}
