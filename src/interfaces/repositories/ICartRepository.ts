import { IBaseRepository } from "./IBaseRepository";
import { ICart } from "../../models/cart.model";
export interface ICartRepository extends IBaseRepository<ICart> {}