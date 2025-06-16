// src/dto/userAddress.dto.ts

import { z } from "zod";
import mongoose from "mongoose";

export const AddressSchema = z.object({
  userId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid userId",
  }),
  addressType: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  isDefault: z.boolean(),
});

const objectIdSchema = z.custom<mongoose.Types.ObjectId>(
  (val) => {
    return val instanceof mongoose.Types.ObjectId;
  },
  {
    message: "Invalid ObjectId",
  }
);
export const ResponseAddress = z.object({
  userId: objectIdSchema,
  addressType: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  isDefault: z.boolean(),
});

export type AddAddressRequestDTO = z.infer<typeof AddressSchema>;
export const UpdateAddressRequestSchema = z.object({
  addressForm: AddressSchema,
  _id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid address ID",
  }),
  userId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid user ID",
  }),
});
export type UpdateAddressRequestDTO = z.infer<
  typeof UpdateAddressRequestSchema
>;
export const SetDefaultAddressSchema = z.object({
  addressId: z.string().min(1),
  userId: z.string().min(1),
});
export const UpdateAddressResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().min(1),
  address: ResponseAddress,
});
export type UpdateAddressResponseDTO = z.infer<
  typeof UpdateAddressResponseSchema
>;
export type SetDefaultAddressRequestDTO = z.infer<
  typeof SetDefaultAddressSchema
>;
export const DeleteAddressRequestSchema = z.object({
  addressId: z
    .string()
    .min(1)
    .refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid addressId",
    }),
  userId: z
    .string()
    .min(1)
    .refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid userId",
    }),
});

export type DeleteAddressRequestDTO = z.infer<
  typeof DeleteAddressRequestSchema
>;

export const GetAddressesResponseSchema = z.object({
    success:z.boolean(),
    message:z.string(),
    address:z.array(AddressSchema)
})

export type GetAddressesResponseDTO = z.infer<typeof GetAddressesResponseSchema>
export type AddressDTO = z.infer<typeof AddressSchema>

export type AddressResponseDTO = AddAddressRequestDTO & {
  _id: string;
};

export interface SuccessResponse {
  success: true;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
}
