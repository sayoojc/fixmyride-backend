import { z } from "zod";
export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number | string;
  amount_paid: number | string;
  amount_due: number | string;
  currency: string;
  receipt?: string | undefined;
  status: string;
  attempts: number;
  created_at: number;
}
export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}
const AddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  state: z.string(),
  zipCode: z.string(),
});

export interface AvailableDate {
  date: string;
  available: boolean;
  timeSlots: TimeSlot[];
}
export const CreateRazorpayOrderRequestSchema = z.object({
  amount: z.number(),
});

export const CreateRazorpayOrderResponseSchema = z.object({
  success: z.boolean(),
  order: z.object({
    id: z.string(),
    entity: z.string(),
    amount: z.union([z.number(), z.string()]),
    amount_paid: z.union([z.number(), z.string()]),
    amount_due: z.union([z.number(), z.string()]),
    currency: z.string(),
    receipt: z.string().optional(),
    status: z.string(),
    attempts: z.number(),
    created_at: z.number(),
  }),
});
export const verifyRazorpayPaymentRequestSchema = z.object({
  orderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  cartId: z.string(),
  selectedAddressId: z.union([z.string(), AddressSchema]),
  selectedDate: z.object({
    date: z.string(),
    available: z.boolean(),
    timeSlots: z.array(
      z.object({
        id: z.string(),
        time: z.string(),
        available: z.boolean(),
      })
    ),
  }),
  selectedSlot: z.object({
    id: z.string(),
    time: z.string(),
    available: z.boolean(),
  }),
});
export const verifyRazorpayPaymentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  orderId:z.string(),
});
export const ErrorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
// Address Schema
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
// User Schema (embedded in Order)
const OrderUserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
});

// Vehicle Schema
const OrderVehicleSchema = z.object({
  _id: z.string(),
  brandId: z.string(),
  modelId: z.string(),
  brandName: z.string(),
  modelName: z.string(),
  fuel: z.string(),
});

// Price Breakup
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

// Service Package inside Order
const OrderServiceSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  fuelType: z.string(),
  servicePackageCategory: z.string(),
  priceBreakup: PriceBreakupSchema,
});

// Coupon Schema
const CouponSchema = z
  .object({
    code: z.string().optional(),
    discountType: z.enum(["percentage", "flat"]).optional(),
    discountValue: z.number(),
    discountAmount: z.number(),
    applied: z.boolean(),
  })
  .optional();

// Full Order Schema
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

export const getOrderDetailsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  order: OrderResponseSchema,
});
export const getOrderHistoryResponseSchema = z.object({
  success:z.boolean(),
  message:z.string(),
  orders:z.array(OrderResponseSchema),
  pagination:z.object(  {totalOrders: z.number(),
    totalPages:  z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
    currentPage:  z.number()})
});
export const placeCashOrderRequestSchema = z.object({
  cartId: z.string(),
  paymentMethod:z.string(),
  selectedAddressId: z.union([z.string(), AddressSchema]),
  selectedDate: z.object({
    date: z.string(),
    available: z.boolean(),
    timeSlots: z.array(
      z.object({
        id: z.string(),
        time: z.string(),
        available: z.boolean(),
      })
    ),
  }),
  selectedSlot: z.object({
    id: z.string(),
    time: z.string(),
    available: z.boolean(),
  }),
});
export type PlaceCashOrderRequestDTO = z.infer<typeof placeCashOrderRequestSchema> 
export type GetOrderHistoryResponseDTO = z.infer<typeof getOrderHistoryResponseSchema>
export type OrderDTO = z.infer<typeof OrderResponseSchema>
export type GetOrderDetailsResponseDTO = z.infer<
  typeof getOrderDetailsResponseSchema
>;
export type verifyRazorpayPaymentResponseDTO = z.infer<
  typeof verifyRazorpayPaymentRequestSchema
>;
export type verifyRazorpayPaymentRequestDTO = z.infer<
  typeof verifyRazorpayPaymentRequestSchema
>;
export type ErrorResponseDTO = z.infer<typeof ErrorResponseSchema>;
export type CreateRazorpayOrderResponseDTO = z.infer<
  typeof CreateRazorpayOrderRequestSchema
>;
export type CreateRazorpayOrderRequestDTO = z.infer<
  typeof CreateRazorpayOrderRequestSchema
>;
