import { z } from "zod";
import mongoose from "mongoose";

export type SlotBulkUpdateOperation = {
  updateOne: {
    filter: {
      providerId: mongoose.Types.ObjectId;
      date: Date;
    };
    update: {
      $set: {
        providerId: mongoose.Types.ObjectId;
        date: Date;
        timeSlots: {
          startTime: string;
          endTime: string;
          status: "active" | "inactive" | "booked";
        }[];
      };
    };
    upsert: boolean;
  };
};

const timeSlotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  status:z.enum(["active","inactive","booked"]),
  bookedBy: z.string().optional(),
});

export const slotResponseSchema = z.object({
  _id: z.string(),
  providerId: z.string(),
  date: z.string(),
  timeSlots: z.array(timeSlotSchema),
  status: z.string(),
});
export const errorResponseSchema = z.object({
    success:z.boolean(),
    message:z.string(),
})

export const slotResponseArraySchema = z.array(slotResponseSchema);
export const getSlotsResponseSchema = z.object({
    success:z.boolean(),
    message:z.string(),
    slots:slotResponseArraySchema
});

const bookingDetailsSchema = z.object({
  clientName: z.string(),
  serviceType: z.string(),
  vehicleInfo: z.string(),
});

const slotDataSchema = z.object({
  status:z.enum(["active","inactive","booked"]),
  bookingDetails: bookingDetailsSchema.optional(),
});

const weeklySlotSchema = z.object({
  date: z.string(),
  dayName: z.string(),
  slots: z.record(z.string(), slotDataSchema), 
});

export const updateSlotsRequestSchema = z.object({
  weeklySlots: z.array(weeklySlotSchema).min(1),
});
export type WeekySlotDTO = z.infer<typeof weeklySlotSchema>
export type UpdateSlotsRequestDTO = z.infer<typeof updateSlotsRequestSchema>;
export type ErrorResponseDTO = z.infer<typeof errorResponseSchema>;
export type GetSlotsResponseDTO = z.infer<typeof getSlotsResponseSchema>;
