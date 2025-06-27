import { Server } from "socket.io";

export interface ISocketService {
  initialize(server: any): void;
  getIO(): Server;
}
