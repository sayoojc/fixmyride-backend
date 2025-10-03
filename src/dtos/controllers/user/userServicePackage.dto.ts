import { z } from "zod";

const PartSchema = z.object({
  name: z.string().min(1, "Part name is required").max(100, "Part name too long"),
  price: z.number().min(0, "Price must be positive").max(999999, "Price too high"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(1000, "Quantity too high"),
})
const PriceBreakupSchema = z.object({
  parts: z.array(PartSchema).max(50, "Too many parts"),
  laborCharge: z.number().min(0, "Labor charge must be positive").max(999999, "Labor charge too high"),
  discount: z.number().min(0, "Discount must be positive").max(999999, "Discount too high").optional(),
  tax: z.number().min(0, "Tax must be positive").max(999999, "Tax too high").optional(),
  total: z.number().min(0, "Total must be positive").max(999999, "Total too high"),
})
export const ServicePackageSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long").trim(),
  description: z.string().min(1, "Description is required").max(500, "Description too long").trim(),
  brandId: z.string().min(1, "Brand is required"),
  modelId: z.string().min(1, "Model is required"),
  fuelType: z.enum(['petrol','diesel','lpg','cng'], {
    required_error: "Fuel type is required",
    invalid_type_error: "Invalid fuel type",
  }),
  servicesIncluded: z
    .array(z.string().min(1, "Service name cannot be empty"))
    .min(1, "At least one service is required")
    .max(20, "Too many services"),
  priceBreakup: PriceBreakupSchema,
})

const BrandSchema = z.object({
  brandName: z.string(),
  imageUrl: z.string(),
  status: z.string()
});

const ModelSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
  status: z.string(),
  fuelTypes: z.array(z.string())
});
export const ServicePackageSchemaWithPopulatedRefs = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().min(1).max(500).trim(),
  brandId: BrandSchema, 
  modelId: ModelSchema, 
  fuelType: z.enum(['petrol', 'diesel', 'lpg', 'cng']),
  servicesIncluded: z.array(z.string().min(1)).min(1).max(20),
  priceBreakup: PriceBreakupSchema
});


export const ErrorResponseSchema = z.object({
    success:z.boolean(),
    message:z.string(),
})

export const EmergencyServicePackageSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().min(1).max(500).trim(),
  servicesIncluded: z.array(z.string().min(1)).min(1).max(20),
  emergencyServiceFee: z.number().min(0, "Emergency fee must be positive"),
  priceBreakup: PriceBreakupSchema.optional(),
  isEmergency: z.literal(true),
});
export const GetServicePackagesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  servicePackages: z.array(
    z.union([ServicePackageSchemaWithPopulatedRefs, EmergencyServicePackageSchema])
  )
});

export const GetServicePackageByIdResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  servicePackage: z.union([ServicePackageSchemaWithPopulatedRefs, EmergencyServicePackageSchema])
});


export type GetServicePackageByIdResponseDTO = z.infer<typeof GetServicePackageByIdResponseSchema >
export type GetServicePackagesResponseDTO = z.infer<typeof GetServicePackagesResponseSchema >
export type ServicePckage = z.infer<typeof ServicePackageSchemaWithPopulatedRefs>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>