import { AddToCartDataDTO } from "../../../dtos/services/user/cart.service.dto";
import { SerializedCart } from "../../Cart.interface";

export interface IUserCartService {
  addToCart(data: AddToCartDataDTO): Promise<SerializedCart | undefined>;
  addVehicleToCart(vehicleId: string, userId: string): Promise<SerializedCart>;
  removeFromCart(userId:string,cartId:string,packageId:string):Promise<SerializedCart>
  getCart(id:string,vehicleId:string):Promise<SerializedCart | undefined>
}
