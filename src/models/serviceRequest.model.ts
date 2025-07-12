import mongoose, { Document, Schema, Types } from "mongoose";
import { ServiceCategoryEnum } from "../enums/serviceCategor.enum";
export interface INearbyProvider {
  providerId: Types.ObjectId;
  socketId?: string;
  status: "notified" | "accepted" | "rejected" | "timed_out";
  responseTime?: Date;
}

export interface IServiceRequest extends Document {
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  serviceType: string;
  location: {
    lat: number;
    lng: number;
  };
  status: "pending" | "accepted" | "expired" | "cancelled";
  nearbyProviders: INearbyProvider[];
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    serviceType: {
      type: String,
      enum: Object.values(ServiceCategoryEnum),
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "cancelled"],
      default: "pending",
    },
    nearbyProviders: [
      {
        providerId: {
          type: Schema.Types.ObjectId,
          ref: "Provider",
          required: true,
        },
        socketId: { type: String },
        status: {
          type: String,
          enum: ["notified", "accepted", "rejected", "timed_out"],
          default: "notified",
        },
        responseTime: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

const ServiceRequest = mongoose.model<IServiceRequest>(
  "ServiceRequest",
  ServiceRequestSchema
);

export default ServiceRequest;
