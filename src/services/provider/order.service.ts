import { inject,injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IOrderRepository } from "../../interfaces/repositories/IOrderRepository";
import { IProviderOrderService } from "../../interfaces/services/provider/IProviderOrderService";
import { IOrder } from "../../models/order.model";
@injectable()
export class ProviderOrderService implements IProviderOrderService {
    constructor (
        @inject(TYPES.OrderRepository) private readonly _orderRepository:IOrderRepository
    ){}
    async getOrderData(id:string):Promise<IOrder | null>{
        try {
            const order = await this._orderRepository.findOne({_id:id});
            return order
        } catch (error) {
            return null
        }
    }
    async getOrders(providerId: string): Promise<IOrder[]> {
        try {
            const orders = await this._orderRepository.find({ "provider._id": providerId });
            return orders;
        } catch (error) {
            return [];
        }
    }
}