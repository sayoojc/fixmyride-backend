import { z } from "zod";

// ---------------------
// Request DTOs
// ---------------------

export const AddModelRequestSchema = z.object({
  model: z.string().min(1, "Model name is required"),
  imageUrl: z.string().url("Invalid image URL"),
  brandId: z.string().min(1, "Brand ID is required"),
  fuelTypes: z.array(z.string().min(1)).nonempty("At least one fuel type is required"),
});

export const ToggleModelStatusRequestSchema = z.object({
  brandId: z.string().min(1, "Brand ID is required"),
  newStatus: z.enum(["active", "blocked"], {
    required_error: "Status must be either 'active' or 'inactive'",
  }),
});

export const UpdateModelRequestSchema = z.object({
  brandId: z.string().min(1, "Model ID is required"),
  name: z.string().min(1, "Model name is required"),
  imageUrl: z.string().url("Invalid image URL"),
  fuelTypes: z.array(z.string().min(1)).nonempty("At least one fuel type is required"),
});

// ---------------------
// Reusable Model Schema
// ---------------------

export const ModelSchema = z.object({
  _id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  brandId: z.string(),
  fuelTypes: z.array(z.string()),
  status: z.string(), // or you can use z.enum(["active", "inactive"]) if needed
});

// ---------------------
// Response DTOs
// ---------------------

export const AddModelResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  model: ModelSchema,
});

export const ToggleModelStatusResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  model: ModelSchema.optional(),
});

export const UpdateModelResponseSchema = z.object({
  message: z.string(),
  model: ModelSchema,
});

// ---------------------
// TypeScript Types
// ---------------------

export type AddModelRequestDTO = z.infer<typeof AddModelRequestSchema>;
export type ToggleModelStatusRequestDTO = z.infer<typeof ToggleModelStatusRequestSchema>;
export type UpdateModelRequestDTO = z.infer<typeof UpdateModelRequestSchema>;

export type AddModelResponseDTO = z.infer<typeof AddModelResponseSchema>;
export type ToggleModelStatusResponseDTO = z.infer<typeof ToggleModelStatusResponseSchema>;
export type UpdateModelResponseDTO = z.infer<typeof UpdateModelResponseSchema>;
