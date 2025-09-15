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
}
