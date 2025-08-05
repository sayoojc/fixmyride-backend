import { z } from "zod";

export const notificationSchema = z.object({
  _id:z.string(),
  recipientId: z.string(),
  recipientType: z.enum(["user", "provider"]),
  type: z.enum(["service_request", "order", "info", "admin_announcement"]),
  message: z.string(),
  link: z.string().optional(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const getNotificationsSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  notifications: z.array(notificationSchema),
  totalPages:z.number(),
  unreadCount:z.number(),
});

export const getNotificationsFailureSchema = z.object({
  success: z.literal(false),
  message: z.string(),
});

export const markNotificationAsReadResponseSchema = z.object({
  success:z.boolean(),
  message:z.string(),
});
export const markNotificationAsUnreadResponseSchema = z.object({
  success:z.boolean(),
  message:z.string(),
});
export const deleteNotificationResponseSchema = z.object({
  success:z.boolean(),
  message:z.string(),
});
export const markAllAsReadResponseSchema = z.object({
  success:z.boolean(),
  message:z.string()
});
export type markAllAsReadResponseDTO = z.infer<typeof markAllAsReadResponseSchema>
export type DeleteNotificationResponseDTO = z.infer<typeof deleteNotificationResponseSchema>
export type MarkNotificationAsUnreadResponseDTO = z.infer<typeof markNotificationAsUnreadResponseSchema>
export type MarkNotificationAsReadResponseDTO = z.infer<typeof markNotificationAsReadResponseSchema>
export type GetNotificationsSuccessResponse = z.infer<typeof getNotificationsSuccessSchema>;
export type GetNotificationsFailureResponse = z.infer<typeof getNotificationsFailureSchema>;
export type GetNotificationsResponse = GetNotificationsSuccessResponse | GetNotificationsFailureResponse;
