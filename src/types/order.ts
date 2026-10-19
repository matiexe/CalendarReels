export type OrderStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface VideoOrderDTO {
  id: string;
  title: string;
  clientName: string;
  platform: string;
  description: string | null;
  scheduledAt: string; // ISO string (YYYY-MM-DD or full ISO)
  price: number;
  isPaid: boolean;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SaveOrderInput {
  id?: string;
  title: string;
  clientName: string;
  platform: string;
  description?: string;
  scheduledAt: string; // YYYY-MM-DD
  price: number;
  isPaid: boolean;
  status: OrderStatus;
}
