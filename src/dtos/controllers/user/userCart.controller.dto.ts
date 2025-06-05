import { z } from "zod";
import mongoose from "mongoose";

export const ObjectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const CouponSchema = z.object({
  code: z.string().trim().max(50).optional(),
  discountType: z.enum(["percentage", "flat"]).optional(),
  discountValue: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  applied: z.boolean().default(false),
});

export const ServiceSchema = z.object({
  serviceId: ObjectIdSchema,
  scheduledDate: z.date().optional(),
  notes: z.string().max(500).optional(),
});

export const AddServiceToCartRequestSchema = z.object({
  serviceId: ObjectIdSchema,
  vehicleId:ObjectIdSchema
});


// ✅ Brand Schema
export const BrandSchema = z.object({
  _id: z.string(),
  brandName: z.string(),
  imageUrl: z.string(),
  status: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type BrandDTO = z.infer<typeof BrandSchema>;

// ✅ Model Schema
export const ModelSchema = z.object({
  _id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  brandId: z.string(), // If brand is populated, replace with BrandSchema
  fuelTypes: z.array(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ModelDTO = z.infer<typeof ModelSchema>;

// ✅ Vehicle Schema
export const VehicleSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  brandId: BrandSchema,
  modelId: ModelSchema,
  fuel: z.string(),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type VehicleDTO = z.infer<typeof VehicleSchema>;

export const CartSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  vehicleId: VehicleSchema,
  services: z.array(ServiceSchema).optional(),
  coupon: CouponSchema.optional(),
  totalAmount: z.number().optional(),
  finalAmount: z.number().optional(),
  isCheckedOut: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const AddServiceToCartResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  cart:CartSchema
});

export const GetCartResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  cart: CartSchema,
});

export const AddVehicleToCartRequestSchema = z.object({
  vehicleId:z.string()
});

export const AddVehicleToCartResponseSchema = z.object({
  success:z.boolean(),
  message:z.string(),
  cart:CartSchema
})

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
});


export type AddToCartRequestDTO = z.infer<typeof AddServiceToCartRequestSchema >
export type AddToCartResponseDTO = z.infer<typeof AddServiceToCartResponseSchema >
export type ErrorResponseDTO = z.infer<typeof ErrorResponseSchema>
export type AddVehicleToCartRequestDTO = z.infer<typeof AddVehicleToCartRequestSchema>
export type AddVehicleToCartResponseDTO = z.infer<typeof AddVehicleToCartResponseSchema>