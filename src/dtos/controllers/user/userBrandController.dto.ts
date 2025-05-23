import { z } from "zod";

// Schema for a single model
export const ModelSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "Model name is required"),
  imageUrl: z.string().url("Invalid image URL"),
  status: z.string().min(1, "Status is required"),
  brandId: z.string(),
  fuelTypes: z.array(z.string()).min(1, "At least one fuel type is required"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Schema for a single brand, including models
export const BrandSchema = z.object({
  _id: z.string(),
  brandName: z.string().min(1, "Brand name is required"),
  imageUrl: z.string().url("Invalid image URL"),
  status: z.string().min(1, "Status is required"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  models: z.array(ModelSchema),
});

// Schema for getBrands response
export const GetBrandsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().min(1, "Message is required"),
  brands: z.array(BrandSchema),
});

// Inferred TypeScript types
export type ModelDTO = z.infer<typeof ModelSchema>;
export type BrandDTO = z.infer<typeof BrandSchema>;
export type GetBrandsResponseDTO = z.infer<typeof GetBrandsResponseSchema>;

// Generic Success and Error Response Interfaces
export interface SuccessResponse {
  success: true;
  message: string;
  [key: string]: any; // Allow additional fields like 'brands'
}

export interface ErrorResponse {
  success: false;
  message: string;
}