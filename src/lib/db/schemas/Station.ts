// Station schema definition
// This is a type definition only and does not modify existing database structure

export interface Station {
  _id: string;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  status: 'active' | 'maintenance' | 'inactive';
  totalSlots: number;
  availableSlots: number;
  pricing: {
    perKwh: number; // Price in rupees per kWh
    serviceCharge: number; // Service charge in rupees
  };
  features: string[]; // e.g., ['fast-charging', 'solar-powered']
  createdAt: Date;
  updatedAt: Date;
}