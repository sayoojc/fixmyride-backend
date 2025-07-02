import { z } from "zod";

// ---------------------
// Reusable Provider Schema
// ---------------------

export const ProviderSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  address: z.string().optional(),
  description: z.string().optional(),
  profileImage: z.string().url().optional(),
  isListed: z.boolean().optional(),
  verificationStatus: z.enum(["pending", "approved", "rejected"]).optional(),
})

export interface SanitizedProvider {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  description: string;
  profileImage: string;
  verificationStatus: string;
  isListed: boolean;
  location:{
    type:string,
    coordinates:[number,number]
  }
}

// ---------------------
// Request DTOs
// ---------------------
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  pinCode: z.string(),
});

export const UpdateProfileRequestSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10).max(15, "Phone number must be between 10-15 digits"),
  addressToSend:AddressSchema,
  description: z.string().optional(),
  isListed: z.boolean().optional(),
  verificationStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  profileImage: z.string().url("Invalid URL").optional(),
  startedYear: z.number().optional(),
})


export const VerifyProviderRequestSchema = z.object({
  verificationData: z.any(),
})

// ---------------------
// Response DTOs
// ---------------------
export interface GetProfileDataResponseDTO {
  success: true;
  message: string;
  provider: SanitizedProvider;
}
export const GetProfileDataResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  provider: ProviderSchema,
})

export const UpdateProfileResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  provider: ProviderSchema,
})

export const VerifyProviderResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
})
export type SuccessMessageDTO = {
  success: true;
  message: string;
};

export type ErrorResponse = {
  success?: false;
  message: string;
};
// ---------------------
// TypeScript Types
// ---------------------

export type UpdateProfileRequestDTO = z.infer<typeof UpdateProfileRequestSchema>;
export type VerifyProviderRequestDTO = z.infer<typeof VerifyProviderRequestSchema>;

export type UpdateProfileResponseDTO = z.infer<typeof UpdateProfileResponseSchema>;
export type VerifyProviderResponseDTO = z.infer<typeof VerifyProviderResponseSchema>;
