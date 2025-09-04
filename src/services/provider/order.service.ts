import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IOrderRepository } from "../../interfaces/repositories/IOrderRepository";
import { IProviderOrderService } from "../../interfaces/services/provider/IProviderOrderService";
import { IOrder } from "../../models/order.model";
import { UpdateQuery } from "mongoose";
import mongoose from "mongoose";
@injectable()
export class ProviderOrderService implements IProviderOrderService {
  constructor(
    @inject(TYPES.OrderRepository)
    private readonly _orderRepository: IOrderRepository
  ) {}
  async getOrderData(id: string): Promise<IOrder | null> {
    try {
      const order = await this._orderRepository.findOne({ _id: id });
      return order;
    } catch (error) {
      return null;
    }
  }
  async getOrders(
    providerId: string,
    search: string,
    page: number,
    limit: number,
    status: string,
    dateFilter: string,
    startDate: string,
    endDate: string
  ): Promise<{orders:IOrder[],totalPages:number,totalOrders:number}> {
    try {
      const {orders,totalPages,totalOrders} = await this._orderRepository.fetchOrdersByProvider(
        providerId,
        search,
        page,
        limit,
        status,
        dateFilter,
        startDate,
        endDate
      );
      return {orders,totalOrders,totalPages};
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error
    }
  }

  async updateOrderStatus(
    orderId: string,
    providerId: string,
    name: string,
    email: string,
    phone: string
  ): Promise<boolean> {
    try {
      console.log("the update order status service data", {
        orderId,
        providerId,
        name,
        email,
        phone,
      });
      const orderObjectId = new mongoose.Types.ObjectId(orderId);
      const order = await this._orderRepository.findOne({
        _id: orderObjectId,
      });

      if (!order) {
        return false;
      }
      const updateData: UpdateQuery<IOrder> = {
        $set: {
          orderStatus: "in-progress",
          "provider._id": providerId,
          "provider.name": name,
          "provider.email": email,
          "provider.phone": phone,
          updatedAt: new Date(),
        },
      };
      await this._orderRepository.updateById(orderObjectId, updateData);
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      return false;
    }
  }
}
