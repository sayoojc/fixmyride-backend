import { z } from "zod";


export const NotificationSchema = z.object({
  _id: z.string(),
  recipientId: z.string(),
  recipientType: z.enum(["user", "provider","admin"]),
  type: z.enum(["service_request", "order", "info", "admin_announcement"]),
  message: z.string(),
  link: z.string().optional(),
  isRead: z.boolean().default(false),
  createdAt: z.string(),
});


export const FetchNotificationsResponseSchema = z.object({
  notifications: z.array(NotificationSchema),
  totalCount: z.number(),
  totalPages: z.number(),
  success: z.boolean(),
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const MarkNotificationAsReadSchema = z.object({
  success:z.boolean(),
  message:z.string(),
  notification:NotificationSchema
});

export type MarkNotificationAsReadDTO = z.infer<typeof MarkNotificationAsReadSchema>
export type NotificationDTO = z.infer<typeof NotificationSchema>;
export type FetchNotificationsResponseDTO = z.infer<typeof FetchNotificationsResponseSchema>;
export type ErrorResponseDTO = z.infer<typeof ErrorResponseSchema>;
