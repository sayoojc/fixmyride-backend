
import { IOrderService } from "../models/order.model";
import { Types } from "mongoose";
export type NotificationQuery = {
  recipientId: string;
  recipientType: "provider" | "user";
  isRead?: boolean;
  type?: string;
  $or?: Array<{
    title?: { $regex: string; $options: string };
    message?: { $regex: string; $options: string };
  }>;
};


export interface NotificationPayload {
  id: string;
  type: "info" | "warning" | "error";
  message: string;
  link?: string;
  createdAt: Date;
}

export interface NearbyServicePayload {
  orderId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  services: IOrderService[];
  message: string;
}
1