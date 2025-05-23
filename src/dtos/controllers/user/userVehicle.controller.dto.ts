import { z } from "zod";
import mongoose from "mongoose";


export const BrandSchema = z.object({
  _id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid Brand ID",
  }),
  brandName: z.string().min(1, "Brand name is required"),
  imgeUrl: z.string().min(1, "imgeUrl is required"),
  status: z.string().min(1, "status is required"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export const ModelSchema = z.object({
_id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid Brand ID",
  }),
  name: z.string().min(1, "name is required"),
  imageUrl: z.string().min(1, "image url is required"),
  status:  z.string().min(1, "status is required"),
  brandId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid Brand ID",
  }),
  fuelTypes:z.array(z.string()),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})
// Schema for a vehicle
export const VehicleSchema = z.object({
  _id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid vehicle ID",
  }),
  userId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid user ID",
  }),
  brandId: BrandSchema,
  modelId:ModelSchema,
  fuel:z.string()
});

// Request DTO for addVehicle
export const AddVehicleRequestSchema = z.object({
  brandId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid brand ID",
  }),
  brandName: z.string().min(1, "Brand name is required"),
  modelId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid model ID",
  }),
  modelName: z.string().min(1, "Model name is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
});

// Response DTO for addVehicle
export const AddVehicleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().min(1, "Message is required"),
  vehicle: VehicleSchema,
});

// Inferred TypeScript types
export type VehicleDTO = z.infer<typeof VehicleSchema>;
export type AddVehicleRequestDTO = z.infer<typeof AddVehicleRequestSchema>;
export type AddVehicleResponseDTO = z.infer<typeof AddVehicleResponseSchema>;

// Generic Error Response Interface
export interface ErrorResponse {
  success: false;
  message: string;
}