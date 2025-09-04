import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IProviderSlotService } from "../../interfaces/services/provider/IproviderSlotService";
import { ISlotRepository } from "../../interfaces/repositories/ISlotRepository";
import { ISlot } from "../../models/slot.model";
import { WeeklySlotDTO } from "../../dtos/controllers/provider/providerSlot.controller.dto";
import { TIME_SLOTS } from "../../constants/timeSlot";
import { IHourStatus } from "../../models/slot.model";
import { UpdateQuery } from "mongoose";
import mongoose from "mongoose";

@injectable()
export class ProviderSlotService implements IProviderSlotService {
  constructor(
    @inject(TYPES.SlotRepository)
    private readonly _slotRepository: ISlotRepository
  ) {}
  async getSlots(id: string): Promise<ISlot[]> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(id);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      const slots = await this._slotRepository.find({
        providerId: userObjectId,
        date: {
          $gte: today,
          $lte: sevenDaysLater,
        },
      });
      console.log("slots", slots);
      return slots;
    } catch (error) {
      throw error;
    }
  }
async updateSlots(
  id: string,
  weeklySlots: WeeklySlotDTO[]
): Promise<ISlot[]> {
  try {
    console.log('the weekly slots in the service',weeklySlots);
    const providerId = new mongoose.Types.ObjectId(id);
    const updatedSlots: ISlot[] = [];

    for (const slot of weeklySlots) {
      const formattedHours: Record<number, IHourStatus> = {};

      for (const [hour, status] of Object.entries(slot.hours)) {
        formattedHours[parseInt(hour)] = status as IHourStatus;
      }

      const updateData: UpdateQuery<ISlot> = {
        $set: {
          dayName: slot.dayName,
          employees: slot.employees,
          hours: formattedHours,
        },
      };

      const updated = await this._slotRepository.findOneAndUpdate(
        { providerId, date: new Date(slot.date) },
        updateData,
        { new: true, upsert: true }
      );

      if (updated) {
        updatedSlots.push(updated);
      }
    }

    return updatedSlots;
  } catch (error) {
    throw error;
  }
}

}
