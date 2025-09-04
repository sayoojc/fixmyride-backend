import { z } from "zod";

// Nested schemas
const OrderUserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
});

const OrderVehicleSchema = z.object({
  _id: z.string(),
  brandId: z.string(),
  modelId: z.string(),
  brandName: z.string(),
  modelName: z.string(),
  fuel: z.string(),
});


const PriceBreakupSchema = z.object({
  parts: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
  laborCharge: z.number(),
  discount: z.number().default(0),
  tax: z.number().default(0),
  total: z.number(),
});

const OrderServiceSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  fuelType: z.string(),
  servicePackageCategory: z.string(),
  priceBreakup: PriceBreakupSchema,
});

const CouponSchema = z
  .object({
    code: z.string().optional(),
    discountType: z.enum(["percentage", "flat"]).optional(),
    discountValue: z.number(),
    discountAmount: z.number(),
    applied: z.boolean(),
  })
  .optional();

const AddressOrderSchema = z.object({
  _id: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
});

// Final Order Schema
export const OrderResponseSchema = z.object({
  _id: z.string(),
  user: OrderUserSchema,
  vehicle: OrderVehicleSchema,
  services: z.array(OrderServiceSchema),
  coupon: CouponSchema,
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
  address: AddressOrderSchema,
});


export const ErrorResponseSchema = z.object({
  success: z.boolean(), 
  message: z.string(),
});

export const fetchOrdersResponseSchema = z.object({  
  orders: z.array(OrderResponseSchema),
  totalCount: z.number(),
  totalPages: z.number(),
  success: z.boolean(),
  message: z.string(),
});

export const fetchOrderByIdResponseSchema = z.object({
  order: OrderResponseSchema, 
  success: z.boolean(),
  message: z.string(),
});

export type FetchOrderByIdResponseDTO = z.infer<typeof fetchOrderByIdResponseSchema>;
export type OrderDTO = z.infer<typeof OrderResponseSchema>;
export type ErrorResponseDTO = z.infer<typeof ErrorResponseSchema>;
export type FetchOrdersResponseDTO = z.infer<typeof fetchOrdersResponseSchema>;
