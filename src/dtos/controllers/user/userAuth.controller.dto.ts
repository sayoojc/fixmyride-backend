import { z } from "zod";

// Request DTOs
export const RegisterTempRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterRequestSchema = z.object({
  otpValue: z.string().min(6, "OTP must be 6 digits"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Response DTOs
export const UserResponseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  // Add other user fields as needed, excluding sensitive fields like password
});

export const RegisterTempResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().min(1),
  email: z.string().email(),
});

export const RegisterResponseSchema = z.object({
  message: z.string().min(1),
  user: UserResponseSchema,
});

export const LoginResponseSchema = z.object({
  message: z.string().min(1),
  user: UserResponseSchema,
});

export const LogoutResponseSchema = z.object({
  message: z.string().min(1),
});

export const ForgotPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().min(1),
});

export const ResetPasswordResponseSchema = z.object({
  message: z.string().min(1),
});

// Inferred TypeScript types
export type RegisterTempRequestDTO = z.infer<typeof RegisterTempRequestSchema>;
export type RegisterRequestDTO = z.infer<typeof RegisterRequestSchema>;
export type LoginRequestDTO = z.infer<typeof LoginRequestSchema>;
export type ForgotPasswordRequestDTO = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequestDTO = z.infer<typeof ResetPasswordRequestSchema>;

export type RegisterTempResponseDTO = z.infer<typeof RegisterTempResponseSchema>;
export type RegisterResponseDTO = z.infer<typeof RegisterResponseSchema>;
export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>;
export type LogoutResponseDTO = z.infer<typeof LogoutResponseSchema>;
export type ForgotPasswordResponseDTO = z.infer<typeof ForgotPasswordResponseSchema>;
export type ResetPasswordResponseDTO = z.infer<typeof ResetPasswordResponseSchema>;

// Generic Success and Error Response Interfaces
export interface SuccessResponse {
  success: true;
  message: string;
  [key: string]: any; // Allow additional fields
}

export interface ErrorResponse {
  success: false;
  message: string;
}