import mongoose, { Schema, Document } from "mongoose";
import { ServiceCategoryEnum } from "../enums/serviceCategor.enum";
interface IPart {
  name: string;
  price: number;
  quantity: number;
}

interface IPriceBreakup {
  parts: IPart[];
  laborCharge: number;
  discount?: number;
  tax?: number;
  total: number;
}

export interface IServicePackage extends Document {
  title: string;
  description: string;
  brandId?: mongoose.Types.ObjectId;
  modelId?: mongoose.Types.ObjectId;
  fuelType?: "petrol" | "diesel" | "lpg" | "cng";
  servicesIncluded: string[];
  imageUrl: string;
  workHours?: number;
  numberOfEmployees?: number;
  priceBreakup?: IPriceBreakup;
  isEmergency: boolean;
  emergencyServiceFee?:number;
  isBlocked: boolean;
  createdAt: Date;
  servicePackageCategory: string;
}


const ServicePackageSchema = new Schema<IServicePackage>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: function () {
        return !this.isEmergency;
      },
    },
    modelId: {
      type: Schema.Types.ObjectId,
      ref: "Model",
      required: function () {
        return !this.isEmergency;
      },
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "lpg", "cng"],
      required: function () {
        return !this.isEmergency;
      },
    },
    servicesIncluded: { type: [String], required: true },
    imageUrl: { type: String, required: true },
    servicePackageCategory: {
      type: String,
      enum: Object.values(ServiceCategoryEnum),
      required: true,
    },
    workHours: {
      type: Number,
      required: function () {
        return !this.isEmergency;
      },
    },
    numberOfEmployees: { type: Number, required: true },
    priceBreakup: {
      parts: [
        {
          name: { type: String },
          price: { type: Number },
          quantity: { type: Number },
        },
      ],
      laborCharge: { type: Number },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number },
    },
    emergencyServiceFee:{type : Number},
    isEmergency: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IServicePackage>(
  "ServicePackage",
  ServicePackageSchema
);
