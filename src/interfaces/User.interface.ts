import { IAddress } from "../models/address.model";
export interface TempUser {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp:string;
    createdAt:Date;
}
export interface SanitizedUser {
  name: string;
  email: string;
  phone?: string;
  role: string;
  isListed: boolean;
};

import { IVehicle } from "../models/vehicle.model";
import { IBrand } from  '../models/brand.model';
import { IModel } from "../models/model.model";

export type IVehiclePopulated = Omit<IVehicle, "brandId" | "modelId"> & {
  brandId: IBrand;
  modelId: IModel;
};
export type UserProfileDTO = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "provider";
  isListed: boolean;
  provider?: "local" | "google";
  addresses: IAddress[];
  defaultAddress: string;
  vehicles: IVehiclePopulated[];
};