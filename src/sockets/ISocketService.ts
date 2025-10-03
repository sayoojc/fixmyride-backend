import { Server } from "socket.io";

export interface ISocketService {
  initialize(server: any): void;
  getIO(): Server;
  emitToNearbyProviders(
    customerLat: number,
    customerLng: number,
    event: string,
    data: any
  ): void;
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
