import { IOrder } from "../../../models/order.model";

export interface IProviderOrderService {
  getOrderData(id: string): Promise<IOrder | null>;
  getOrders(providerId: string,
    search: string,
    page: number,
    limit: number,
    status: string,
    dateFilter: string,
    startDate: string,
    endDate: string): Promise<{orders:IOrder[],totalPages:number,totalOrders:number}>;
  updateOrderStatus(
    orderId: string,
    providerId: string,
    name: string,
    email: string,
    phone: string
  ): Promise<boolean>;
  
}
