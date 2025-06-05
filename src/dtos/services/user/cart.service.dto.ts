import { z } from "zod";
import mongoose from "mongoose";

export const AddToCartDataSchema = z.object({
  userId: z.string(),
  serviceId: z.string(),
  vehicleId: z.string(),
});

export const AddVehicleToCartSchema = z.object({});
export const ObjectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const CouponSchema = z.object({
  code: z.string().trim().max(50).optional(),
  discountType: z.enum(["percentage", "flat"]).optional(),
  discountValue: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  applied: z.boolean().default(false),
});

export const ServiceSchema = z.object({
  serviceId: ObjectIdSchema,
  scheduledDate: z.date().optional(),
  notes: z.string().max(500).optional(),
});

export const CartSchema = z
  .object({
    _id: ObjectIdSchema,
    userId: ObjectIdSchema,
    vehicleId: ObjectIdSchema,

    services: z.array(ServiceSchema).optional(),
    coupon: CouponSchema.optional(),
    totalAmount: z.number().optional(),
    finalAmount: z.number().optional(),
    isCheckedOut: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
 .transform((cart) => ({
  ...cart,
  _id: cart._id.toString(),
  userId: cart.userId.toString(),
  vehicleId: cart.vehicleId.toString(),
  services: Array.isArray(cart.services)
    ? cart.services.map((s) => ({
        ...s,
        serviceId: s.serviceId.toString(),
      }))
    : [],
}));

export type AddToCartDataDTO = z.infer<typeof AddToCartDataSchema>;
