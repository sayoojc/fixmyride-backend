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

export const DeleteVehicleResponseSchema = z.object({
  success:z.boolean(),
  message:z.string(),
});
export const GetVehicleResponseSchema = z.object({
  success:z.boolean(),
  message:z.string(),
  vehicles:z.array(VehicleSchema)
})
export const EditVehicleRequestSchema = z.object({
    brandId:z.string(),
    modelId:z.string(),
    fuel:z.string(),
    isDefault:z.boolean(),
});
export const EditVehicleResponseSchema = z.object({
  success:z.boolean(),
  message:z.string(),
  vehicle:VehicleSchema
})
export type EditVehicleResponseDTO = z.infer<typeof EditVehicleResponseSchema>;
export type EditVehicleRequestDTO = z.infer<typeof EditVehicleRequestSchema>;
export type DeleteVehicleResponseDTO = z.infer<typeof DeleteVehicleResponseSchema>;
export type VehicleDTO = z.infer<typeof VehicleSchema>;
export type AddVehicleRequestDTO = z.infer<typeof AddVehicleRequestSchema>;
export type AddVehicleResponseDTO = z.infer<typeof AddVehicleResponseSchema>;
export type GetVehicleResponseDTO = z.infer<typeof GetVehicleResponseSchema>

export interface ErrorResponse {
  success: false;
  message: string;
}