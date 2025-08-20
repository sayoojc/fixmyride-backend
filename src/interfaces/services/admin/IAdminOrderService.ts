import { OrderDTO } from "../../../dtos/controllers/admin/adminOrder.cotroller.dto";

export interface IAdminOrderService {
  fetchOrders(
    search: string,
    skip: number,
    limit: number,
    statusFilter: string,
    dateFilter: string,
    startDate?: string | undefined,
    endDate?: string | undefined
  ): Promise<{
    sanitizedOrders: OrderDTO[];
    totalCount: number;
    totalPages: number;
  }>;
  fetchOrderById(orderId: string): Promise<OrderDTO | null>;
}
