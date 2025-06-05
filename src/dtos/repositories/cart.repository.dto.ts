import { z } from "zod";


export const AddToCartDataSchema = z.object({
    userId:z.string(),
    serviceId: z.string(),
    vehicleId: z.string()
})

export type AddToCartDataDTO = z.infer<typeof AddToCartDataSchema>