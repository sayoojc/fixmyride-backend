import mongoose from "mongoose";

export interface ICoupon {
  code?: string;
  discountType?: "percentage" | "flat";
  discountValue: number;
  discountAmount: number;
  applied: boolean;
}

export interface SerializedCart {
  _id: string;
  userId: string;

  vehicleId: {
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
  };

  services: {
    serviceId: {
      _id: string;
      title: string;
      description: string;
      brandId: string;
      modelId: string;
      fuelType: "petrol" | "diesel" | "lpg" | "cng";
      servicesIncluded: string[];
      priceBreakup: {
        parts: {
          name: string;
          price: number;
          quantity: number;
        }[];
        laborCharge: number;
        discount?: number;
        tax?: number;
        total: number;
      };
      isBlocked: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    scheduledDate?: Date;
    notes?: string;
  }[];

  coupon?: {
    code?: string;
    discountType?: "percentage" | "flat";
    discountValue: number;
    discountAmount: number;
    applied: boolean;
  };

  totalAmount?: number;
  finalAmount?: number;
  isCheckedOut: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IService {
  serviceId: mongoose.Types.ObjectId;

}
export interface IServicePackage {
  _id: string;
  title: string;
  description: string;
  brandId: string;
  modelId: string;
  fuelType: "petrol" | "diesel" | "lpg" | "cng";
  servicesIncluded: string[];
  servicePackageCategory:string;
  priceBreakup: {
    parts: {
      name: string;
      price: number;
      quantity: number;
    }[];
    laborCharge: number;
    discount?: number;
    tax?: number;
    total: number;
  };
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
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

export interface IPopulatedCart extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  services?: IServicePackage[];
  coupon?: ICoupon;
  totalAmount?: number;
  finalAmount?: number;
  isCheckedOut?: boolean;
  vehicleId: IVehicle;
  createdAt: Date;
  updatedAt: Date;
}
