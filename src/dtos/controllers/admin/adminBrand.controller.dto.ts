import { z } from "zod";

// ---------------------
// Request DTOs
// ---------------------

export const AddBrandRequestSchema = z.object({
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  imageUrl: z.string().url("Invalid image URL"),
});

export const ToggleBrandStatusRequestSchema = z.object({
  brandId: z.string().min(1, "Brand ID is required"),
  newStatus: z.string(),
});

export const UpdateBrandRequestSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(2, "Brand name must be at least 2 characters"),
  imageUrl: z.string().url("Invalid image URL"),
});

// ---------------------
// Response DTOs
// ---------------------

export const BrandSchema = z.object({
  _id: z.string(),
  brandName: z.string(),
  imageUrl: z.string(),
  status: z.string(),
});

export const AddBrandResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  brand: BrandSchema,
});

export const GetBrandsResponseSchema = z.object({
  success: z.literal(true),
  message: z.literal("Brands fetched successfully"),
  BrandObject:z.object({formattedBrands:z.array(BrandSchema),totalPage:z.number()}) ,
});

export const ToggleBrandStatusResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  brand: BrandSchema.optional(),
});

export const UpdateBrandResponseSchema = z.object({
  message: z.string(),
  brand: BrandSchema,
});

// ---------------------
// TypeScript Types
// ---------------------

export type AddBrandRequestDTO = z.infer<typeof AddBrandRequestSchema>;
export type ToggleBrandStatusRequestDTO = z.infer<typeof ToggleBrandStatusRequestSchema>;
export type UpdateBrandRequestDTO = z.infer<typeof UpdateBrandRequestSchema>;

export type AddBrandResponseDTO = z.infer<typeof AddBrandResponseSchema>;
export type GetBrandsResponseDTO = z.infer<typeof GetBrandsResponseSchema>;
export type ToggleBrandStatusResponseDTO = z.infer<typeof ToggleBrandStatusResponseSchema>;
export type UpdateBrandResponseDTO = z.infer<typeof UpdateBrandResponseSchema>;
