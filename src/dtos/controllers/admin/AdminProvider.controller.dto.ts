// src/dtos/admin/admin.provider.dto.ts

import { z } from "zod";

// ---------------------
// Request DTOs
// ---------------------

export const VerifyProviderRequestSchema = z.object({
  verificationAction: z.enum(["Verified", "Rejected"], {
    required_error: "Verification action must be either 'approve' or 'reject'",
  }),
  adminNotes: z.string().optional(),
}).strict();

export const ToggleListingRequestSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
}).strict();

// ---------------------
// Reusable Provider Schema
// ---------------------

export const ProviderSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  isListed: z.boolean(),
  verificationStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  // add more fields if needed like phone, address, etc.
}).strict()

// ---------------------
// Response DTOs
// ---------------------

export const VerifyProviderResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  provider: ProviderSchema,
}).strict()

export const ToggleListingResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  user: ProviderSchema,
}).strict();

export const FetchProvidersResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
 providerResponse: z.object({
sanitizedProviders: z.array(ProviderSchema),
totalPage:z.number()
  })
  
}).strict();

export const FetchProviderResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  provider: ProviderSchema,
}).strict();

export const FetchVerificationDataResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  verificationData: z.any(), // define the shape if you know it
}).strict();

// ---------------------
// TypeScript Types
// ---------------------

export type VerifyProviderRequestDTO = z.infer<typeof VerifyProviderRequestSchema>;
export type ToggleListingRequestDTO = z.infer<typeof ToggleListingRequestSchema>;

export type VerifyProviderResponseDTO = z.infer<typeof VerifyProviderResponseSchema>;
export type ToggleListingResponseDTO = z.infer<typeof ToggleListingResponseSchema>;
export type FetchProvidersResponseDTO = z.infer<typeof FetchProvidersResponseSchema>;
export type FetchProviderResponseDTO = z.infer<typeof FetchProviderResponseSchema>;
export type FetchVerificationDataResponseDTO = z.infer<typeof FetchVerificationDataResponseSchema>;
