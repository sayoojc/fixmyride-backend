import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IOrderRepository } from "../../interfaces/repositories/IOrderRepository";
import { IAdminOrderService } from "../../interfaces/services/admin/IAdminOrderService";
import { OrderDTO } from "../../dtos/controllers/admin/adminOrder.cotroller.dto";
import { Types } from "mongoose";

@injectable()
export class AdminOrderService implements IAdminOrderService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly _orderRepository: IOrderRepository
  ) {}

    async fetchOrders(
        search: string,
        skip: number,
        limit: number,
        statusFilter: string,
        dateFilter: string,
        startDate?: string | undefined,
        endDate?: string | undefined
    ): Promise<{ sanitizedOrders: OrderDTO[]; totalCount: number,totalPages: number }> {
        try {
        const { orders, totalCount,totalPages } = await this._orderRepository.fetchAllOrders(
            search,
            skip,
            limit,
            statusFilter,
            dateFilter,
            startDate,
            endDate
        );
     const sanitizedOrders = orders.map((order: any) => ({
      ...order.toObject(),
      _id: order._id.toString(),
      user: order.user ? { ...order.user, _id: order.user._id?.toString() } : null,
      vehicle: order.vehicle ? { ...order.vehicle, _id: order.vehicle._id?.toString() } : null,
      address: order.address ? { ...order.address, _id: order.address._id?.toString() } : null,
      services: order.services.map((s: any) => ({
        ...s,
        _id: s._id.toString(),   // ✅ fix here
      })),
      coupon: order.coupon ? { ...order.coupon, _id: order.coupon._id?.toString() } : null,
      createdAt: order.createdAt?.toISOString(),
      updatedAt: order.updatedAt?.toISOString(),
    }));

        return { sanitizedOrders, totalCount,totalPages };
        } catch (error) {
        return { sanitizedOrders: [], totalCount: 0 ,totalPages: 0 };
        }
    }
    async fetchOrderById(orderId: string): Promise<OrderDTO | null> {
        try {
            const orderIdObject = new Types.ObjectId(orderId);
            const order = await this._orderRepository.fetchOrderById(orderIdObject);
            if (!order) {
                return null;
            }
            return {
                
      ...order.toObject(),
      _id: order._id.toString(),
      user: {
        ...order.user,
        _id: order.user._id.toString(),
      },
      vehicle: {
        ...order.vehicle,
        _id: order.vehicle._id.toString(),
        brandId: order.vehicle.brandId.toString(),
        modelId: order.vehicle.modelId.toString(),
      
    }
            };
        } catch (error) {
            return null;
        }
    } 

}
