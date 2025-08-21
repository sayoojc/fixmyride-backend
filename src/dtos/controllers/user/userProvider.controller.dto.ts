import { z } from "zod";

// Nested schemas
const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
});

const LocationSchema = z.object({
  type: z.literal("Point").default("Point"),
  coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
});

const BankDetailsSchema = z.object({
  accountHolderName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  bankName: z.string().optional(),
});

// Main service provider schema
export const ServiceProviderSchema = z.object({
  _id: z.string().optional(), // will come from Mongo
  name: z.string(),
  ownerName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  googleId: z.string().optional(),
  provider: z.string().optional(),
  address: AddressSchema.optional(),
  location: LocationSchema,
  isListed: z.boolean().default(true),
  verificationStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  password: z.string().optional(),
  license: z.string().optional(),
  ownerIdProof: z.string().optional(),
  profilePicture: z.string().optional(),
  coverPhoto: z.string().optional(),
  bankDetails: BankDetailsSchema.optional(),
  startedYear: z.number().optional(),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// For multiple providers response
export const ServiceProviderArraySchema = z.array(ServiceProviderSchema);

export const FetchProviderResponseSchema = z.object({
  providers: ServiceProviderArraySchema,
  success:z.boolean(),
  message:z.string().optional(),
});
export const ErrorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

export type ErrorResposnseDTO = z.infer<typeof ErrorResponseSchema>;
export type IServiceProviderDTO = z.infer<typeof ServiceProviderSchema>;
export type IServiceProviderArray = z.infer<typeof ServiceProviderArraySchema>;
export type IFetchProviderResponseDTO = z.infer<typeof FetchProviderResponseSchema>;