// Station validation schema
export const stationSchema = {
  validate: (data: any) => {
    // Check required fields
    if (!data.name || typeof data.name !== 'string') return false;
    if (!data.address || typeof data.address !== 'string') return false;
    if (!data.city || typeof data.city !== 'string') return false;
    if (!data.status || !['active', 'maintenance', 'inactive'].includes(data.status)) return false;
    if (typeof data.totalSlots !== 'number') return false;
    if (typeof data.availableSlots !== 'number') return false;
    
    // Validate location
    if (!data.location || typeof data.location !== 'object') return false;
    if (data.location.type !== 'Point') return false;
    if (!Array.isArray(data.location.coordinates) || data.location.coordinates.length !== 2) return false;
    if (typeof data.location.coordinates[0] !== 'number' || typeof data.location.coordinates[1] !== 'number') return false;
    
    // Validate pricing
    if (!data.pricing || typeof data.pricing !== 'object') return false;
    if (typeof data.pricing.perKwh !== 'number') return false;
    if (typeof data.pricing.serviceCharge !== 'number') return false;
    
    // Validate features array
    if (!Array.isArray(data.features)) return false;
    
    // Validate slot numbers
    if (data.totalSlots < 0) return false;
    if (data.availableSlots < 0) return false;
    if (data.availableSlots > data.totalSlots) return false;
    
    return true;
  }
};