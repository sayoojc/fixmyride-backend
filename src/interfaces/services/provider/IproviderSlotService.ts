import { ISlot } from "../../../models/slot.model"
import { WeekySlotDTO } from "../../../dtos/controllers/provider/providerSlot.controller.dto"

export interface IProviderSlotService {
   getSlots(id:string):Promise<ISlot[] | undefined>
   updateSlots(id:string,weeklySlots:WeekySlotDTO[]):Promise<ISlot[]>
}