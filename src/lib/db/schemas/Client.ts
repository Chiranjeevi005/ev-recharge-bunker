// Client schema definition
// This is a type definition only and does not modify existing database structure

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  profileImage?: string;
  totalChargingSessions?: number;
  totalAmountSpent?: number;
  co2Saved?: number; 
}