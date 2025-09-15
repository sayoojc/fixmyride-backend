import {z} from 'zod'
import { ServicePackageSchema } from '../../controllers/admin/adminServicePackageController.dto'
export const UpdateServicePackageServiceSchema = z.object({
  id:z.string(),
  data:ServicePackageSchema
});
export const ToggleBlockServicePackageServiceSchema = z.object({
    id:z.string(),
    actionType:z.string()
})
export type ToggleBlockServicePackageServiceDTO = z.infer<typeof ToggleBlockServicePackageServiceSchema>
export type UpdateServicepackageServiceDTO = z.infer<typeof UpdateServicePackageServiceSchema>
