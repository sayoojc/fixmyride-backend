import { Server } from "socket.io";
import { NearbyServicePayload } from "../interfaces/notification.interface";
import { Types } from "mongoose";
export interface ISocketService {
  initialize(server: any): void;
  getIO(): Server;
 emitToProviders(
   providers: { providerId: Types.ObjectId; socketId?: string;status:string }[],
   event: string,
   data: NearbyServicePayload
 ): Promise<void>;
  emitToUser(
  role: "admin" | "user" | "provider",
  id: string,
  event: string,
  data: any
): Promise<void>
emitOrderUpdate(
  userId: string,
  update: {
    orderId: string;
    status:
      | "placed"
      | "accepted"
      | "provider_nearby"
      | "picked"
      | "reached_station"
      | "started"
      | "completed"
      | "returning"
      | "delivered";
    message: string;
    progress?: number;
    timestamp?: Date;
  }
): Promise<void>
}
