// AuditLog schema definition
// This is a type definition only and does not modify existing database structure

export interface AuditLog {
  _id: string;
  userId: string;
  action: string; // e.g., 'CREATE', 'UPDATE', 'DELETE'
  resource: string; // e.g., 'client', 'station', 'payment'
  resourceId: string;
  details: Record<string, any>; // Additional details about the action
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}