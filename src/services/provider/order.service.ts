import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IOrderRepository } from "../../interfaces/repositories/IOrderRepository";
import { IProviderOrderService } from "../../interfaces/services/provider/IProviderOrderService";
import { INotificationRepository } from "../../interfaces/repositories/INotificationRepository";
import { IOrder } from "../../models/order.model";
import { UpdateQuery } from "mongoose";
import mongoose from "mongoose";
import { ISocketService } from "../../sockets/ISocketService";
import { IProviderRepository } from "../../interfaces/repositories/IProviderRepository";
@injectable()
export class ProviderOrderService implements IProviderOrderService {
  constructor(
    @inject(TYPES.OrderRepository)
    private readonly _orderRepository: IOrderRepository,
    private readonly _notificationRepository: INotificationRepository,
    private readonly _socketService:ISocketService,
    private readonly _providerRepository:IProviderRepository,
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
     const updated =  await this._orderRepository.updateById(orderObjectId, updateData);
      if(!updated){
        return false
      }
      const provider = await this._providerRepository.findOne({_id:providerId});
      if(!provider){
        return false
      }
     const notification = await this._notificationRepository.create({
      recipientId: order.user._id,
      recipientType: "user",
      type: "order",
      message: `Your order ${updated._id} is committed by ${provider.name}.`,
      isRead: false,
      link: `/user/orders/${updated._id}`,
    });
       if (notification) {
      await this._socketService.emitToUser(
        "user",
        order.user._id.toString(),
        "notification:new",
        {
          id: notification._id.toString(),
          type: notification.type,
          message: notification.message,
        }
      );
    }
      return true;
    } catch (error) {
      return false;
    }
  }
}
