// Payment schema definition
// This is a type definition only and does not modify existing database structure

export interface Payment {
  _id: string;
  userId: string;
  stationId: string;
  orderId: string;
  paymentId?: string;
  amount: number; // in rupees
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  currency: string;
  method?: string; // e.g., 'card', 'upi', 'wallet'
  sessionId?: string; // Reference to charging session
  createdAt: Date;
  updatedAt: Date;
}