import { connectToDatabase } from '@/lib/db';
import type { WithId, Document } from 'mongodb';

/**
 * Security audit utilities
 */

// Security audit log interface
export interface SecurityAuditLog {
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  ip?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
}

/**
 * Log a security event to the audit log collection
 * @param log - The security audit log entry (without timestamp)
 */
export async function logSecurityEvent(log: Omit<SecurityAuditLog, 'timestamp'>): Promise<void> {
  try {
    const { db } = await connectToDatabase();
    await db.collection('security_audit').insertOne({
      ...log,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // In production, you might want to use a different logging mechanism
    // if the database is unavailable
  }
}

/**
 * Get security audit logs with filtering and pagination
 * @param filter - Filter criteria
 * @param page - Page number (1-based)
 * @param limit - Number of records per page
 */
export async function getSecurityAuditLogs(
  filter: Partial<Omit<SecurityAuditLog, 'timestamp'>> = {},
  page: number = 1,
  limit: number = 50
): Promise<{ logs: SecurityAuditLog[]; total: number }> {
  try {
    const { db } = await connectToDatabase();
    const skip = (page - 1) * limit;
    
    const logs = (await db.collection('security_audit')
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()) as unknown as SecurityAuditLog[];
    
    const total = await db.collection('security_audit').countDocuments(filter);
    
    return { logs, total };
  } catch (error) {
    console.error('Failed to retrieve security audit logs:', error);
    return { logs: [], total: 0 };
  }
}

/**
 * Perform a security audit of the application
 */
export async function performSecurityAudit(): Promise<void> {
  try {
    console.log('Starting security audit...');
    
    const { db } = await connectToDatabase();
    
    // Check for users with weak passwords (in a real app, you'd check password hashes)
    const usersWithWeakPasswords = await db.collection('clients').find({
      password: { $exists: true, $ne: null }
    }).toArray();
    
    if (usersWithWeakPasswords.length > 0) {
      await logSecurityEvent({
        action: 'AUDIT_FINDING',
        resource: 'clients',
        severity: 'medium',
        details: {
          message: 'Found users with potentially weak password storage',
          count: usersWithWeakPasswords.length
        }
      });
    }
    
    // Check for admin users without 2FA (simplified check)
    const adminsWithout2FA = await db.collection('clients').find({
      role: 'admin',
      twoFactorEnabled: { $ne: true }
    }).toArray();
    
    if (adminsWithout2FA.length > 0) {
      await logSecurityEvent({
        action: 'AUDIT_FINDING',
        resource: 'clients',
        severity: 'high',
        details: {
          message: 'Found admin users without 2FA enabled',
          count: adminsWithout2FA.length
        }
      });
    }
    
    // Check for excessive failed login attempts
    const recentFailedLogins = await db.collection('security_audit').find({
      action: 'FAILED_LOGIN',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      severity: 'medium'
    }).toArray();
    
    if (recentFailedLogins.length > 100) {
      await logSecurityEvent({
        action: 'AUDIT_FINDING',
        resource: 'security_audit',
        severity: 'high',
        details: {
          message: 'High number of failed login attempts detected',
          count: recentFailedLogins.length
        }
      });
    }
    
    console.log('Security audit completed.');
  } catch (error) {
    console.error('Security audit failed:', error);
    await logSecurityEvent({
      action: 'AUDIT_ERROR',
      resource: 'system',
      severity: 'critical',
      details: {
        message: 'Security audit failed',
        error: error instanceof Error ? error.message : String(error)
      }
    });
  }
}

export default {
  logSecurityEvent,
  getSecurityAuditLogs,
  performSecurityAudit
};