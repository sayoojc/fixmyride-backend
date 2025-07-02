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
  addressLine2: z.string(),
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
       orderId:z.string(),
        razorpayPaymentId:z.string(),
        razorpaySignature:z.string(),
        cartId:z.string(),
       selectedAddressId: z.union([z.string(), AddressSchema]),
        selectedDate:z.object({
            date:z.string(),
            available:z.boolean(),
            timeSlots:z.array(z.object({
                id:z.string(),
                time:z.string(),
                available:z.boolean(),
            }))
        }),
        selectedSlot:z.object({
            id:z.string(),
            time:z.string(),
            available:z.boolean()
        }),
})
export const verifyRazorpayPaymentResponseSchema = z.object({
    success:z.boolean(),
    message:z.string(),
})
export const ErrorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type verifyRazorpayPaymentResponseDTO = z.infer<typeof verifyRazorpayPaymentRequestSchema>
export type verifyRazorpayPaymentRequestDTO  = z.infer<typeof verifyRazorpayPaymentRequestSchema>
export type ErrorResponseDTO = z.infer<typeof ErrorResponseSchema>;
export type CreateRazorpayOrderResponseDTO = z.infer<
  typeof CreateRazorpayOrderRequestSchema
>;
export type CreateRazorpayOrderRequestDTO = z.infer<
  typeof CreateRazorpayOrderRequestSchema
>;
