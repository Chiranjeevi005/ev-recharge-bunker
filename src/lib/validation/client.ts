// Client validation schema
export const clientSchema = {
  validate: (data: any) => {
    // Check required fields
    if (!data.name || typeof data.name !== 'string') return false;
    if (!data.email || typeof data.email !== 'string') return false;
    if (!data.role || !['client', 'admin'].includes(data.role)) return false;
    if (!data.status || !['active', 'inactive', 'suspended'].includes(data.status)) return false;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) return false;
    
    // Validate optional fields
    if (data.phone && typeof data.phone !== 'string') return false;
    if (data.googleId && typeof data.googleId !== 'string') return false;
    if (data.totalChargingSessions && typeof data.totalChargingSessions !== 'number') return false;
    if (data.totalAmountSpent && typeof data.totalAmountSpent !== 'number') return false;
    if (data.co2Saved && typeof data.co2Saved !== 'number') return false;
    
    return true;
  }
};