import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IProviderSlotService } from "../../interfaces/services/provider/IproviderSlotService";
import { ISlotRepository } from "../../interfaces/repositories/ISlotRepository";
import { ISlot } from "../../models/slot.model";
import { WeekySlotDTO } from "../../dtos/controllers/provider/providerSlot.controller.dto";
import { TIME_SLOTS } from "../../constants/timeSlot";
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
  async updateSlots(id: string, weeklySlots: WeekySlotDTO[]): Promise<ISlot[]> {
    try {
      const providerId = new mongoose.Types.ObjectId(id);
      console.log('the weekly slots form the updateslots service function ',weeklySlots);
      for (const weeklySlot of weeklySlots) {
        const slotDate = new Date(weeklySlot.date);
        const timeSlots = Object.entries(weeklySlot.slots).map(
          ([slotId, slotData]) => {
            const slotMeta = TIME_SLOTS.find((s) => s.id === slotId);
            if (!slotMeta) throw new Error(`Invalid slotId: ${slotId}`);

            return {
              startTime: slotMeta.startTime,
              endTime: slotMeta.endTime,
              status: slotData.status,
            };
          }
        );
        await this._slotRepository.updateSlotForDay(
          providerId,
          slotDate,
          timeSlots
        );
      }
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const slots = await this._slotRepository.find({
        providerId: providerId,
        date: {
          $gte: startOfWeek,
          $lte: endOfWeek,
        },
      });
      return slots
    } catch (error) {
      throw error;
    }
  }
}
