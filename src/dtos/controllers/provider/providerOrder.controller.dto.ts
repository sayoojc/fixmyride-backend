import { z } from "zod";

export const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
});

export const vehicleSchema = z.object({
  _id: z.string(),
  brandId: z.string(),
  modelId: z.string(),
  year: z.number(),
  fuel: z.string(),
  brandName: z.string(),
  modelName: z.string(),
});

export const serviceSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  fuelType: z.string(),
  servicePackageCategory: z.string(),
});
export const addressSchema = z.object({
  _id: z.string().optional(),
  addressLine1: z.string(),
  addressLine2: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
});
export const orderSchema = z.object({
  _id: z.string(),
  user: userSchema,
  vehicle: vehicleSchema,
  services: z.array(serviceSchema),
  totalAmount: z.number(),
  finalAmount: z.number(),
  paymentMethod: z.enum(["cash", "online"]),
  paymentStatus: z.string(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  serviceDate: z.string().optional(),
  selectedSlot: z.string().optional(),
  orderStatus: z.enum([
    "placed",
    "confirmed",
    "in-progress",
    "completed",
    "cancelled",
    "failed",
  ]),
  statusReason: z.string().optional(),
  address: addressSchema,
});

export const GetOrderResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  order: orderSchema,
});

export const ErrorResponseSchema = z.object({
  success:z.boolean(),
  message:z.string()
})

export type GetOrderResponseDTO = z.infer<typeof GetOrderResponseSchema>;
export type ErrorResponseDTO = z.infer<typeof ErrorResponseSchema>