import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  services: mongoose.Types.ObjectId[];
  coupon?: {
    code?: string;
    discountType?: "percentage" | "flat";
    discountValue: number;
    discountAmount: number;
    applied: boolean;
  };
  totalAmount: number;
  finalAmount: number;
  paymentMethod: "cash" | "online";
  paymentStatus: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  serviceDate?: string;
  selectedSlot?: string;
  orderStatus:
    | "placed"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled"
    |"failed";
  statusReason?: string;
  address: mongoose.Types.ObjectId;
}
const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "ServicePackage",
      },
    ],
    coupon: {
      code: String,
      discountType: String,
      discountValue: Number,
      discountAmount: Number,
      applied: Boolean,
    },
    totalAmount: Number,
    finalAmount: Number,
    paymentMethod: String,
    paymentStatus: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    serviceDate: String,
    selectedSlot: String,
    orderStatus: String,
    statusReason: String,
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
  },
  {
    timestamps: true,
  }
);

// Optional indexes
OrderSchema.index({ userId: 1, orderStatus: 1 });
OrderSchema.index({ vehicleId: 1 });
OrderSchema.index({ orderedAt: -1 });

export default mongoose.model<IOrder>("Order", OrderSchema);
