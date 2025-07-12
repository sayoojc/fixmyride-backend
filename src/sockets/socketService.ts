import { injectable } from "inversify";
import { Server, Socket } from "socket.io";
import { ISocketService } from "./ISocketService";
import redis from "../config/redisConfig";

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
        origin: `${process.env.CLIENT_URL}`,
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);
      socket.on(
        "register:provider",
        async (data: {
          providerId: string;
          location: { lat: number; lng: number };
        }) => {
          const { providerId, location } = data;
          console.log(
            `Provider registered: ${providerId} at location`,
            location
          );
          await redis.set(`provider:socket:${providerId}`, socket.id);
          await redis.geoadd(
            "providers:locations",
            location.lng,
            location.lat,
            providerId
          );

          await redis.set(`provider:online:${providerId}`, "true", "EX", 60);
        }

      );

      socket.on("chat:message", (data) => {
        console.log("Chat message received:", data);
        this.io.emit("chat:message", data);
      });
      socket.on("emergency:trigger", (data) => {
        console.log("Emergency triggered:", data);
        this.io.emit("emergency:new", data);
      });

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
    console.log("the emit to providers function hits");
    const providerInfo = this.providerSocketMap.get(providerId);
    if (providerInfo) {
      this.io.to(providerInfo.socketId).emit(event, data);
    }
  }

  public async emitToNearbyProviders(
    customerLat: number,
    customerLng: number,
    event: string,
    data: any
  ): Promise<void> {
    try {
      const providerIds= await redis.georadius(
        "providers:locations",
        customerLng,
        customerLat,
        20,
        "km"
      ) as string[] 

      if (!providerIds.length) {
        console.log("No nearby providers found within 20km.");
        return;
      }
      const pipeline = redis.pipeline();
      providerIds.forEach((id) => pipeline.get(`provider:socket:${id}`));
      const results = await pipeline.exec();
       if (!results) {
      console.error("Redis pipeline returned null.");
      return;
    }
      results.forEach(([err, socketId], index) => {
        const providerId = providerIds[index];
        if (err) {
          console.error(`Redis error for ${providerId}:`, err);
          return;
        }

        if (typeof socketId === "string") {
          this.io.to(socketId).emit(event, data);
          console.log(`🚀 Notified ${providerId} via socket ${socketId}`);
        } else {
          console.log(`⚠️ No socket found for ${providerId}`);
        }
      });
    } catch (err) {
      console.error("Failed to emit to nearby providers:", err);
    }
  }
}
