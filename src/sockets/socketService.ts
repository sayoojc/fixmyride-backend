import { injectable } from "inversify";
import { Server, Socket } from "socket.io";
import { ISocketService } from "./ISocketService";
import redis from "../config/redisConfig";
import { NotificationPayload } from "../interfaces/notification.interface";
import {NearbyServicePayload} from "../interfaces/notification.interface";

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
        "register:role",
        async (data: {
          role: "admin" | "user" | "provider";
          id: string;
          location?: { lat: number; lng: number };
        }) => {
          const { role, id, location } = data;
          console.log(
            ` ${role} ${id} registered`,
            location ? `at ${JSON.stringify(location)}` : ""
          );
          socket.join(`${role}s`);
          socket.join(`${role}:${id}`);
          await redis.set(`${role}:socket:${id}`, socket.id);
          if ((role === "provider" || role === "user") && location) {
            await redis.geoadd(
              `${role}s:locations`,
              location.lng,
              location.lat,
              id
            );
            await redis.set(`${role}:online:${id}`, "true", "EX", 60);
          }
        }
      );
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
        for (const [providerId, info] of this.providerSocketMap.entries()) {
          if (info.socketId === socket.id) {
            this.providerSocketMap.delete(providerId);
            break;
          }
        }
      });
      socket.on(
        "provider:location:update",
        async (data: {
          providerId: string;
          location: { lat: number; lng: number };
          clientId?: string;
        }) => {
          const { providerId, location, clientId } = data;
          console.log(`Location update from ${providerId}:`, location);
          await redis.geoadd(
            "providers:locations",
            location.lng,
            location.lat,
            providerId
          );
          await redis.set(`provider:online:${providerId}`, "true", "EX", 60);
          if (clientId) {
            const clientSocketId = await redis.get(`client:socket:${clientId}`);
            if (clientSocketId) {
              this.io.to(clientSocketId).emit("provider:location:live", {
                providerId,
                location,
              });
            }
          }
        }
      );
    });
  }
  public getIO(): Server {
    if (!this.io) {
      throw new Error("Socket.IO has not been initialized!");
    }
    return this.io;
  }
  public async emitToNearbyProviders(
    customerLat: number,
    customerLng: number,
    event: string,
    data: NearbyServicePayload
  ): Promise<void> {
    try {
      const providerIds = (await redis.georadius(
        "providers:locations",
        customerLng,
        customerLat,
        20,
        "km"
      )) as string[];

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
          console.log(`Notified ${providerId} via socket ${socketId}`);
        } else {
          console.log(`No socket found for ${providerId}`);
        }
      });
    } catch (err) {
      console.error("Failed to emit to nearby providers:", err);
    }
  }
  public async emitToUser(
  role: "admin" | "user" | "provider",
  id: string,
  event: string,
  data: NotificationPayload
): Promise<void> {
  try {
    const socketId = await redis.get(`${role}:socket:${id}`);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      console.log(`Sent ${event} to ${role}:${id} via socket ${socketId}`);
    } else {
      console.log(`No active socket found for ${role}:${id}`);
    }
  } catch (err) {
    console.error(`Failed to send event to ${role}:${id}:`, err);
  }
}
public async emitOrderUpdate(
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
): Promise<void> {
  try {
    const socketId = await redis.get(`user:socket:${userId}`);
    
    if (socketId) {
      this.io.to(socketId).emit("order:update", {
        ...update,
        timestamp: update.timestamp || new Date(),
      });
      console.log(`✅ Sent order update to user:${userId}`, update);
    } else {
      console.log(`⚠️ No active socket for user:${userId}`);
    }
  } catch (err) {
    console.error("❌ Failed to emit order update:", err);
  }
}
public async emitEmergencyService(
  customerLat: number,
  customerLng: number,
  data: {
    emergencyId: string;
    customerId: string;
    message: string;
    location: { lat: number; lng: number };
    timestamp?: Date;
  }
): Promise<void> {
  try {
    const providerIds = (await redis.georadius(
      "providers:locations",
      customerLng,
      customerLat,
      20,
      "km"
    )) as string[];

    if (!providerIds.length) {
      console.log("🚨 No nearby providers available for emergency.");
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
      if (err) return console.error("Redis error:", err);

      if (typeof socketId === "string") {
        this.io.to(socketId).emit("emergency:service:available", {
          ...data,
          timestamp: data.timestamp || new Date(),
        });
        console.log(
          `🚑 Emergency service alert sent to provider:${providerIds[index]}`
        );
      }
    });
  } catch (err) {
    console.error("❌ Failed to emit emergency service:", err);
  }
}


}
