import { z } from "zod";
import mongoose from "mongoose";

// -------------------------
// Bulk Update Operation Type
// -------------------------
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
        dayName: string;
        employees: number;
        hours: {
          [hour: string]: {
            status: "available" | "unavailable" | "booked";
            bookedBy?: mongoose.Types.ObjectId;
          };
        };
      };
    };
    upsert: boolean;
  };
};

// -------------------------
// Zod Schemas
// -------------------------

// Individual hour schema
// hours value can be either a string OR a full object
const hourStatusSchema = z.union([
  z.enum(["available", "unavailable", "booked"]),
  z.object({
    status: z.enum(["available", "unavailable", "booked"]),
    bookedBy: z.string().optional(),
  }),
]);

const weeklySlotSchema = z.object({
  date: z.string(),
  dayName: z.string(),
  employees: z.number(),
  hours: z.record(z.string(), hourStatusSchema),
});


// Slot (single day) schema
export const slotResponseSchema = z.object({
  _id: z.string(),
  providerId: z.string(),
  date: z.string(),
  dayName: z.string(),
  employees: z.number(),
  hours: z.record(z.string(), hourStatusSchema), // key = hour (0-23)
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Error response
export const errorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Multiple slots
export const slotResponseArraySchema = z.array(slotResponseSchema);

// Get slots response
export const getSlotsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  slots: slotResponseArraySchema,
});

export const updateSlotsRequestSchema = z.object({
  weeklySlots: z.array(weeklySlotSchema).min(1),
});

// -------------------------
// Types
// -------------------------
export type WeeklySlotDTO = z.infer<typeof weeklySlotSchema>;
export type UpdateSlotsRequestDTO = z.infer<typeof updateSlotsRequestSchema>;
export type ErrorResponseDTO = z.infer<typeof errorResponseSchema>;
export type GetSlotsResponseDTO = z.infer<typeof getSlotsResponseSchema>;
