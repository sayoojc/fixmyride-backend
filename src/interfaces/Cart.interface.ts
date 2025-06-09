import mongoose from "mongoose";

export interface ICoupon {
  code?: string;
  discountType?: "percentage" | "flat";
  discountValue: number;
  discountAmount: number;
  applied: boolean;
}

export interface SerializedCart {
  userId: string;
  _id: string;
  vehicleId: IVehicle;
  services: {
    serviceId: string;
    scheduledDate?: Date;
    notes?: string;
  }[];
  coupon?: ICoupon;
  totalAmount?: number;
  finalAmount?: number;
  isCheckedOut: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IService {
  serviceId: mongoose.Types.ObjectId;
  scheduledDate?: Date;
  notes?: string;
}

export interface ICoupon {
  code?: string;
  discountType?: "percentage" | "flat";
  discountValue: number;
  discountAmount: number;
  applied: boolean;
}
export interface IVehicle {
   _id: string;
    userId: string;
    fuel: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
    brandId: {
      _id: string;
      brandName: string;
      imageUrl: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    };
    modelId: {
      _id: string;
      name: string;
      imageUrl: string;
      brandId: string;
      fuelTypes: string[];
      createdAt: Date;
      updatedAt: Date;
    };
}

export interface IPopulatedCart extends Document{
  _id:mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  services?: IService[];
  coupon?: ICoupon;
  totalAmount?: number;
  finalAmount?: number;
  isCheckedOut?: boolean;
  vehicleId: IVehicle;
  createdAt: Date;
  updatedAt: Date;
}
