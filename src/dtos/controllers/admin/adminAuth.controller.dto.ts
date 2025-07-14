import { z } from "zod";

export const AdminLoginRequestSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email format" })
    .refine((val) => /^[a-z]/.test(val), {
      message: "Email must start with a lowercase letter",
    })
    .refine((val) => !/[A-Z]/.test(val), {
      message: "Email must not contain uppercase letters",
    })
    .refine((val) => val.endsWith(".com"), {
      message: "Email must end with .com",
    }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});


// Response DTO for successful login
export const AdminLoginResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(["admin", "user"]),
  }),
});

export const AdminLogoutResponseSchema = z.object({
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
    success:z.boolean(),
    message:z.string(),
})


export type ErrorResponseDTO = z.infer<typeof ErrorResponseSchema>
export type AdminLoginRequestDTO = z.infer<typeof AdminLoginRequestSchema>;
export type AdminLoginResponseDTO = z.infer<typeof AdminLoginResponseSchema>;
export type AdminLogoutResponseDTO = z.infer<typeof AdminLogoutResponseSchema>;
