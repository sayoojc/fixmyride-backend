import { injectable } from "inversify";
import { Server, Socket } from "socket.io";
import { ISocketService } from "./ISocketService";

interface ProviderInfo {
  socketId: string;
  location: { lat: number; lng: number };
}

@injectable()
export class SocketService implements ISocketService {
  private io!: Server;
  private providerSocketMap: Map<string, ProviderInfo> = new Map();

  public initialize(server: any): void {
    this.io = new Server(server, {
      cors: {
        origin: "*", // Update as needed
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Register provider with location
      socket.on("register:provider", (data: { providerId: string; location: { lat: number; lng: number } }) => {
        const { providerId, location } = data;
        console.log(`Provider registered: ${providerId} at location`, location);
        this.providerSocketMap.set(providerId, {
          socketId: socket.id,
          location,
        });
      });

      // Receive chat message
      socket.on("chat:message", (data) => {
        console.log("Chat message received:", data);
        this.io.emit("chat:message", data);
      });

      // Emergency trigger
      socket.on("emergency:trigger", (data) => {
        console.log("Emergency triggered:", data);
        this.io.emit("emergency:new", data); // Can be narrowed later
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
        for (const [providerId, info] of this.providerSocketMap.entries()) {
          if (info.socketId === socket.id) {
            this.providerSocketMap.delete(providerId);
            break;
          }
        }
      });
    });
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error("Socket.IO has not been initialized!");
    }
    return this.io;
  }

  public emitToProvider(providerId: string, event: string, data: any): void {
    const providerInfo = this.providerSocketMap.get(providerId);
    if (providerInfo) {
      this.io.to(providerInfo.socketId).emit(event, data);
    }
  }

  // ✅ New: Emit to providers within a 20 km radius
  public emitToNearbyProviders(
    customerLat: number,
    customerLng: number,
    event: string,
    data: any
  ): void {
    for (const [providerId, info] of this.providerSocketMap.entries()) {
      const distance = this.getDistanceFromLatLonInKm(
        customerLat,
        customerLng,
        info.location.lat,
        info.location.lng
      );

      if (distance <= 20) {
        this.io.to(info.socketId).emit(event, data);
        console.log(`🚨 Notified ${providerId} (Distance: ${distance.toFixed(2)} km)`);
      }
    }
  }

  private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
