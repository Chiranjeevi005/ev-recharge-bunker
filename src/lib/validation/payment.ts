// Payment validation schema
export const paymentSchema = {
  validate: (data: any) => {
    // Check required fields
    if (!data.userId || typeof data.userId !== 'string') return false;
    if (!data.stationId || typeof data.stationId !== 'string') return false;
    if (!data.orderId || typeof data.orderId !== 'string') return false;
    if (typeof data.amount !== 'number') return false;
    if (!data.status || !['pending', 'completed', 'failed', 'refunded'].includes(data.status)) return false;
    if (!data.currency || typeof data.currency !== 'string') return false;
    
    // Validate amount
    if (data.amount <= 0) return false;
    
    // Validate optional fields
    if (data.paymentId && typeof data.paymentId !== 'string') return false;
    if (data.method && typeof data.method !== 'string') return false;
    if (data.sessionId && typeof data.sessionId !== 'string') return false;
    
    return true;
  }
};