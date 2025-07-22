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
  brandId:BrandSchema,
  modelId:ModelSchema,
  fuel:z.string()
});

// Schema for an address
export const AddressSchema = z.object({
 id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid address id",
  }),
  userId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid user ID",
  }),
  addressType: z.string().min(1, "Address type is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  isDefault: z.boolean(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Schema for the sanitized user
export const SanitizedUserSchema = z.object({
  id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid user ID",
  }),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  isListed: z.boolean(),
  provider: z.string().optional(),
  addresses: z.array(AddressSchema),
  defaultAddress: z.string(),
  vehicles: z.array(VehicleSchema),
});

// Schema for partial sanitized user (for updateProfile and changePassword)
export const PartialSanitizedUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
});

// Request DTOs
export const UpdateProfileRequestSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  userName: z.string().min(1, "User name is required"),
});

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// Response DTOs
export const GetProfileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().min(1, "Message is required"),
  user: SanitizedUserSchema,
});

export const UpdateProfileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().min(1, "Message is required"),
  user: PartialSanitizedUserSchema,
});

export const ChangePasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().min(1, "Message is required"),
  
});

// Inferred TypeScript types
export type VehicleDTO = z.infer<typeof VehicleSchema>;
export type AddressDTO = z.infer<typeof AddressSchema>;
export type SanitizedUserDTO = z.infer<typeof SanitizedUserSchema>;
export type PartialSanitizedUserDTO = z.infer<typeof PartialSanitizedUserSchema>;
export type UpdateProfileRequestDTO = z.infer<typeof UpdateProfileRequestSchema>;
export type ChangePasswordRequestDTO = z.infer<typeof ChangePasswordRequestSchema>;
export type GetProfileResponseDTO = z.infer<typeof GetProfileResponseSchema>;
export type UpdateProfileResponseDTO = z.infer<typeof UpdateProfileResponseSchema>;
export type ChangePasswordResponseDTO = z.infer<typeof ChangePasswordResponseSchema>;

// Generic Error Response Interface
export interface ErrorResponse {
  success: false;
  message: string;
}

