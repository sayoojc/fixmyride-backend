export type NotificationQuery = {
  recipientId: string;
  recipientType: "provider" | "user";
  isRead?: boolean;
  type?: string;
  $or?: Array<{
    title?: { $regex: string; $options: string };
    message?: { $regex: string; $options: string };
  }>;
};
