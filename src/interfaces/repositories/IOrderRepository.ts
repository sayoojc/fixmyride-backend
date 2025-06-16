import { IBaseRepository } from "./IBaseRepository";
import {IOrder} from '../../models/order.model'
import { Types } from "mongoose";
export interface IOrderRepository extends IBaseRepository<IOrder> {

}
