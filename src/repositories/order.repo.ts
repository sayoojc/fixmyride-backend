import { BaseRepository } from "./base/base.repo";
import {IOrder} from '../models/order.model'
import { Model as MongooseModel } from "mongoose";
import { IOrderRepository } from "../interfaces/repositories/IOrderRepository";
export class OrderRepository extends BaseRepository<IOrder> implements IOrderRepository {
  constructor(orderModel: MongooseModel<IOrder>) {
    super(orderModel);
  }

}
