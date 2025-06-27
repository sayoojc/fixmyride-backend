import mongoose, { Schema, Document } from "mongoose";

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
  brandId: mongoose.Types.ObjectId;
  modelId: mongoose.Types.ObjectId;
  fuelType: "petrol" | "diesel" | "lpg" | "cng";
  servicesIncluded: string[];
  imageUrl:string,
  priceBreakup: IPriceBreakup;
  isBlocked: boolean;
  createdAt: Date;
  servicePackageCategory: string;
}
enum ServiceCategory {
  GENERAL = "general",
  AC = "ac",
  BRAKE = "brake",
  WASHING = "washing",
  DENT = "dent",
  DETAILIng = 'detailing',
  EMERGENCY = 'emergency',
  TYRES = 'tyres',
  BATTERY = 'battery'
}

const ServicePackageSchema = new Schema<IServicePackage>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    modelId: {
      type: Schema.Types.ObjectId,
      ref: "Model",
      required: true,
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "lpg", "cng"],
      required: true,
    },
    servicesIncluded: {
      type: [String],
      required: true,
    },
    imageUrl:{
     type:String,
     required:true
    },
    servicePackageCategory: {
      type: String,
      enum: Object.values(ServiceCategory),
      required: true,
    },
    priceBreakup: {
      parts: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          quantity: { type: Number, required: true },
        },
      ],
      laborCharge: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  { timestamps: true }
);

export default mongoose.model<IServicePackage>(
  "ServicePackage",
  ServicePackageSchema
);
