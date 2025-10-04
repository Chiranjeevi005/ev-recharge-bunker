export interface Payment {
  id: string;
  _id: string;
  userId: string;
  paymentId: string;
  orderId: string;
  amount: number;
  status: string;
  method: string;
  stationId?: string;
  stationName?: string;
  slotId?: string;
  duration?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  date?: string;
}