import mongoose, { Schema, Document, Types } from "mongoose";
import { IUser } from "./user.model";
import { IVehicle } from "./vehicle.model";
import { IServicePackage } from "./servicePackage.model";

export interface IOrder extends Document<Types.ObjectId> {
  user: Pick<IUser, "_id" | "name" | "email" | "phone">;
  provider?:{
    _id: Types.ObjectId;
    name?: string;
    email?: string;
    phone?: string;
  }
  vehicle: Pick<
    IVehicle,
    "_id" | "brandId" | "modelId" | "fuel"
  > & {brandName:string,modelName:string};
  services?: Array<
    Pick<
      IServicePackage,
      | "_id"
      | "title"
      | "description"
      | "fuelType"
      | "priceBreakup"
      | "servicePackageCategory"
    >
  >;
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
    | "failed";
  statusReason?: string;
  address:{
  _id?: Types.ObjectId;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
 
};
 createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
     provider: {
      _id: { type: Schema.Types.ObjectId, ref: "Provider" },
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    vehicle: {
      _id: { type: Schema.Types.ObjectId},
      brandId: { type: Schema.Types.ObjectId},
      brandName:{type:String},
      modelName:{type:String},
      modelId: { type: Schema.Types.ObjectId},
      fuel: { type: String},
    },
    services: [
      {
        _id: { type: Schema.Types.ObjectId,  },
        title: { type: String},
        description: { type: String },
        fuelType: { type: String},
        servicePackageCategory: { type: String },
        priceBreakup: {
          parts: [
            {
              name: { type: String },
              price: { type: Number },
              quantity: { type: Number },
            },
          ],
          laborCharge: { type: Number},
          discount: { type: Number, default: 0 },
          tax: { type: Number, default: 0 },
          total: { type: Number },
        },
      },
    ],
    coupon: {
      code: { type: String },
      discountType: { type: String },
      discountValue: { type: Number },
      discountAmount: { type: Number },
      applied: { type: Boolean },
    },
    totalAmount: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cash", "online"], required: true },
    paymentStatus: { type: String, required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    serviceDate: { type: String },
    selectedSlot: { type: String },
    orderStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "failed",
      ],
      required: true,
    },
    statusReason: { type: String },
    address: {
      _id: { type: Schema.Types.ObjectId },
      addressLine1: { type: String},
      addressLine2: { type: String },
      city: { type: String},
      state: { type: String},
      zipCode: { type: String},
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },
  },
  { timestamps: true }
);

export type IOrderService = Pick<
  IServicePackage,
  "_id" | "title" | "description" | "fuelType" | "priceBreakup" | "servicePackageCategory"
>;
OrderSchema.index({ "user._id": 1, orderStatus: 1 });
OrderSchema.index({ "vehicle._id": 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>("Order", OrderSchema);
