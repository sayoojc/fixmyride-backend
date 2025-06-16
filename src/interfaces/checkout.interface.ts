export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number | string;
  amount_paid: number | string;
  amount_due: number | string;
  currency: string;
  receipt?: string | undefined;
  status: string;
  attempts: number;
  created_at: number;
}
export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface AvailableDate {
  date: string;
  available: boolean;
  timeSlots: TimeSlot[];
}

export type RazorpayPaymentStatus =
  | "created" // Payment created but not yet attempted
  | "authorized" // Payment authorized (for captured payments)
  | "captured" // Payment successfully captured (your main success case)
  | "refunded" // Payment was refunded
  | "failed" // Payment failed or was declined
  | "pending" // Payment is pending processing
  | "disputed" // Payment is disputed by customer
  | "partially_refunded" // Partial refund was processed
  | "expired"; // Payment link expired without payment