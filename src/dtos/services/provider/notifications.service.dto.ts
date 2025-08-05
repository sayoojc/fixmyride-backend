export interface INotificationResponse {
  _id: string;
  recipientId: string;
  recipientType: "user" | "provider";
  type: "service_request" | "order" | "info" | "admin_announcement";
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}