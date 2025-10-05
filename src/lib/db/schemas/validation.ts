// Validation schemas for MongoDB collections
// These schemas are used to validate data before inserting/updating documents

import type { Client } from './Client';
import type { Station } from './Station';
import type { Payment } from './Payment';
import type { AuditLog } from './AuditLog';

// Validation function for Client documents
export function validateClient(client: any): client is Client {
  if (!client || typeof client !== 'object') return false;
  
  // Required fields
  if (!client.name || typeof client.name !== 'string') return false;
  if (!client.email || typeof client.email !== 'string') return false;
  if (!client.role || !['client', 'admin'].includes(client.role)) return false;
  if (!client.status || !['active', 'inactive', 'suspended'].includes(client.status)) return false;
  if (!client.createdAt || !(client.createdAt instanceof Date)) return false;
  if (!client.updatedAt || !(client.updatedAt instanceof Date)) return false;
  
  // Optional fields validation
  if (client.phone && typeof client.phone !== 'string') return false;
  if (client.googleId && typeof client.googleId !== 'string') return false;
  if (client.lastLogin && !(client.lastLogin instanceof Date)) return false;
  if (client.profileImage && typeof client.profileImage !== 'string') return false;
  if (client.totalChargingSessions && typeof client.totalChargingSessions !== 'number') return false;
  if (client.totalAmountSpent && typeof client.totalAmountSpent !== 'number') return false;
  if (client.co2Saved && typeof client.co2Saved !== 'number') return false;
  
  return true;
}

// Validation function for Station documents
export function validateStation(station: any): station is Station {
  if (!station || typeof station !== 'object') return false;
  
  // Required fields
  if (!station.name || typeof station.name !== 'string') return false;
  if (!station.location || typeof station.location !== 'object') return false;
  if (!station.location.type || station.location.type !== 'Point') return false;
  if (!Array.isArray(station.location.coordinates) || station.location.coordinates.length !== 2) return false;
  if (!station.address || typeof station.address !== 'string') return false;
  if (!station.status || !['active', 'maintenance', 'inactive'].includes(station.status)) return false;
  if (typeof station.totalSlots !== 'number') return false;
  if (typeof station.availableSlots !== 'number') return false;
  if (!station.pricing || typeof station.pricing !== 'object') return false;
  if (typeof station.pricing.perKwh !== 'number') return false;
  if (typeof station.pricing.serviceCharge !== 'number') return false;
  if (!Array.isArray(station.features)) return false;
  if (!station.createdAt || !(station.createdAt instanceof Date)) return false;
  if (!station.updatedAt || !(station.updatedAt instanceof Date)) return false;
  
  return true;
}

// Validation function for Payment documents
export function validatePayment(payment: any): payment is Payment {
  if (!payment || typeof payment !== 'object') return false;
  
  // Required fields
  if (!payment.userId || typeof payment.userId !== 'string') return false;
  if (!payment.stationId || typeof payment.stationId !== 'string') return false;
  if (!payment.orderId || typeof payment.orderId !== 'string') return false;
  if (typeof payment.amount !== 'number') return false;
  if (!payment.status || !['pending', 'completed', 'failed', 'refunded'].includes(payment.status)) return false;
  if (!payment.currency || typeof payment.currency !== 'string') return false;
  if (!payment.createdAt || !(payment.createdAt instanceof Date)) return false;
  if (!payment.updatedAt || !(payment.updatedAt instanceof Date)) return false;
  
  // Optional fields validation
  if (payment.paymentId && typeof payment.paymentId !== 'string') return false;
  if (payment.method && typeof payment.method !== 'string') return false;
  if (payment.sessionId && typeof payment.sessionId !== 'string') return false;
  
  return true;
}

// Validation function for AuditLog documents
export function validateAuditLog(auditLog: any): auditLog is AuditLog {
  if (!auditLog || typeof auditLog !== 'object') return false;
  
  // Required fields
  if (!auditLog.userId || typeof auditLog.userId !== 'string') return false;
  if (!auditLog.action || typeof auditLog.action !== 'string') return false;
  if (!auditLog.resource || typeof auditLog.resource !== 'string') return false;
  if (!auditLog.resourceId || typeof auditLog.resourceId !== 'string') return false;
  if (!auditLog.details || typeof auditLog.details !== 'object') return false;
  if (!auditLog.timestamp || !(auditLog.timestamp instanceof Date)) return false;
  
  // Optional fields validation
  if (auditLog.ipAddress && typeof auditLog.ipAddress !== 'string') return false;
  if (auditLog.userAgent && typeof auditLog.userAgent !== 'string') return false;
  
  return true;
}