import { Server } from "socket.io";

export interface ISocketService {
  initialize(server: any): void;
  getIO(): Server;

  emitToProvider(providerId: string, event: string, data: any): void;

  emitToNearbyProviders(
    customerLat: number,
    customerLng: number,
    event: string,
    data: any
  ): void;
}
