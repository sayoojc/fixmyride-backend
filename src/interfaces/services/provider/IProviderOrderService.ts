import { IOrder } from "../../../models/order.model"

export interface IProviderOrderService {
   getOrderData(id:string):Promise<IOrder|null> 
   getOrders(providerId: string): Promise<IOrder[]>
}