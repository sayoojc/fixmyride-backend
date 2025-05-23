import { z } from "zod";

export const ProviderRegisterTempSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      pinCode: z.string().regex(/^\d{6}$/),
    }),
     location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  });
export type ProviderRegisterTempDTO = z.infer<typeof ProviderRegisterTempSchema>;

export const ProviderRegisterSchema = ProviderRegisterTempSchema.extend({
  otp: z.string().length(6),
});
export type ProviderRegisterDTO = z.infer<typeof ProviderRegisterSchema>;

export const ProviderLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type ProviderLoginDTO = z.infer<typeof ProviderLoginSchema>;

export const ProviderUserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  isListed: z.boolean().optional(),
});

export type ProviderUserDTO = z.infer<typeof ProviderUserSchema>;

export const ProviderLoginResponseSchema = z.object({
  message: z.string(),
  user: ProviderUserSchema,
});

export type ProviderLoginResponseDTO = z.infer<typeof ProviderLoginResponseSchema>;

export const SuccessMessageSchema = z.object({
  success: z.literal(true).optional(),
  message: z.string(),
});

export type SuccessMessageDTO = z.infer<typeof SuccessMessageSchema>;

export type ErrorResponse = {
  success?: false;
  message: string;
};
