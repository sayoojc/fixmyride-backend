import { BaseRepository } from "./base/base.repo";
import { IOrder } from "../models/order.model";
import { Model as MongooseModel, Types } from "mongoose";
import { IOrderRepository } from "../interfaces/repositories/IOrderRepository";
import { FilterQuery } from "mongoose";
export class OrderRepository
  extends BaseRepository<IOrder>
  implements IOrderRepository
{
  constructor(orderModel: MongooseModel<IOrder>) {
    super(orderModel);
  }
  async fetchOrders(
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
  }> {
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
  async fetchAllOrders(
    search: string,
    skip: number,
    limit: number,
    statusFilter: string,
    dateFilter: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ orders: IOrder[]; totalCount: number; totalPages: number }> {
    try {
      const query: FilterQuery<IOrder> = {};
      if (search) {
        if (search) {
          query.$or = [
            { "user.name": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
            { "user.phone": { $regex: search, $options: "i" } },

            { "provider.name": { $regex: search, $options: "i" } },
            { "provider.email": { $regex: search, $options: "i" } },
            { "provider.phone": { $regex: search, $options: "i" } },

            { "vehicle.brandName": { $regex: search, $options: "i" } },
            { "vehicle.modelName": { $regex: search, $options: "i" } },

            { "services.title": { $regex: search, $options: "i" } },
            { "services.description": { $regex: search, $options: "i" } },

            { "coupon.code": { $regex: search, $options: "i" } },

            { paymentMethod: { $regex: search, $options: "i" } },
            { paymentStatus: { $regex: search, $options: "i" } },
            { orderStatus: { $regex: search, $options: "i" } },

            { "address.city": { $regex: search, $options: "i" } },
            { "address.state": { $regex: search, $options: "i" } },
            { "address.zipCode": { $regex: search, $options: "i" } },
          ];
        }
      }
      if (statusFilter && statusFilter !== "all") {
        query.orderStatus = statusFilter;
      }
      let dateRange: { $gte?: Date; $lte?: Date } = {};

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (dateFilter) {
        case "today":
          dateRange.$gte = today;
          dateRange.$lte = new Date();
          break;
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          dateRange.$gte = yesterday;
          dateRange.$lte = new Date(today.getTime() - 1);
          break;
        case "last7days":
          const last7 = new Date(today);
          last7.setDate(today.getDate() - 7);
          dateRange.$gte = last7;
          dateRange.$lte = new Date();
          break;
        case "last30days":
          const last30 = new Date(today);
          last30.setDate(today.getDate() - 30);
          dateRange.$gte = last30;
          dateRange.$lte = new Date();
          break;
        case "thismonth":
          const firstDayThisMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          dateRange.$gte = firstDayThisMonth;
          dateRange.$lte = new Date();
          break;
        case "lastmonth":
          const firstDayLastMonth = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
          );
          const lastDayLastMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
          );
          dateRange.$gte = firstDayLastMonth;
          dateRange.$lte = lastDayLastMonth;
          break;
        case "custom":
          if (startDate && endDate) {
            dateRange.$gte = new Date(startDate);
            dateRange.$lte = new Date(endDate);
          }
          break;
      }
      if (Object.keys(dateRange).length > 0) {
        query.createdAt = dateRange;
      }
      const [orders, totalCount] = await Promise.all([
        this.model.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
        this.model.countDocuments(query),
      ]);
      const totalPages = Math.ceil(totalCount / limit) || 1;

      return { orders, totalCount, totalPages };
    } catch (error) {
      return { orders: [], totalCount: 0, totalPages: 0 };
    }
  }
  async fetchOrderById(orderId: Types.ObjectId): Promise<IOrder | null> {
    try {
      return await this.model.findById(orderId).populate("user");
    } catch (error) {
      return null;
    }
  }
  async fetchOrdersByProvider(
    providerId: string,
    search: string,
    page: number,
    limit: number,
    status: string,
    dateFilter: string,
    startDate: string,
    endDate: string
  ): Promise<{ orders: IOrder[]; totalPages: number; totalOrders: number }> {
    try {
      const query: FilterQuery<IOrder> = {
        "provider._id": providerId,
      };
      if (status) {
        if (status !== "all") {
          query.orderStatus = status;
        }
      }
      if (search) {
        query.$or = [
          { "user.name": { $regex: search, $options: "i" } },
          { "user.email": { $regex: search, $options: "i" } },
          { "user.phone": { $regex: search, $options: "i" } },
          { "vehicle.brandName": { $regex: search, $options: "i" } },
          { "vehicle.modelName": { $regex: search, $options: "i" } },
        ];
      }
      if (dateFilter || (startDate && endDate)) {
        let dateQuery: any = {};
        const now = new Date();

        if (dateFilter === "today") {
          const start = new Date(now.setHours(0, 0, 0, 0));
          const end = new Date(now.setHours(23, 59, 59, 999));
          dateQuery = { $gte: start, $lte: end };
        } else if (dateFilter === "week") {
          const start = new Date();
          start.setDate(now.getDate() - 7);
          dateQuery = { $gte: start, $lte: now };
        } else if (dateFilter === "month") {
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          dateQuery = { $gte: start, $lte: end };
        } else if (startDate && endDate) {
          dateQuery = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        if (Object.keys(dateQuery).length > 0) {
          query.createdAt = dateQuery;
        }
      }
      const skip = (page - 1) * limit;
      const totalOrders = await this.model.countDocuments(query);
      const orders = await this.model
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const totalPages = Math.ceil(totalOrders / limit);

      return { orders, totalPages, totalOrders };
    } catch (error) {
      return { orders: [], totalPages: 0, totalOrders: 0 };
    }
  }
}
