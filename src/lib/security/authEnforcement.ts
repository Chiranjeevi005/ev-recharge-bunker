import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/auth/rbac';
import { ajAuth } from '@/lib/arcjet';

/**
 * Auth enforcement utilities
 */

// Define roles
export type Role = 'client' | 'admin';

// Define permissions
export type Permission = 
  | 'read:clients' 
  | 'write:clients' 
  | 'read:stations' 
  | 'write:stations'
  | 'read:payments' 
  | 'write:payments'
  | 'read:audit_logs'
  | 'write:audit_logs'
  | 'read:bookings'
  | 'write:bookings';

// Enhanced role permissions with more granular control
const enhancedRolePermissions: Record<Role, Permission[]> = {
  client: [
    'read:clients',
    'read:stations',
    'read:payments',
    'read:bookings',
    'write:bookings'
  ],
  admin: [
    'read:clients',
    'write:clients',
    'read:stations',
    'write:stations',
    'read:payments',
    'write:payments',
    'read:audit_logs',
    'write:audit_logs',
    'read:bookings',
    'write:bookings'
  ]
};

/**
 * Check if a role has a specific permission
 * @param role - The user role
 * @param permission - The permission to check
 * @returns boolean - Whether the role has the permission
 */
export function hasEnhancedPermission(role: Role, permission: Permission): boolean {
  const permissions = enhancedRolePermissions[role] || [];
  return permissions.includes(permission);
}

/**
 * Enhanced authentication middleware with Arcjet protection
 */
export async function withEnhancedAuth() {
  return async function middleware(request: NextRequest) {
    try {
      // Apply Arcjet protection for authentication
      const decision = await ajAuth.protect(request, { userId: "anonymous" });
      
      if (decision.isDenied()) {
        return NextResponse.json(
          { error: "Too many authentication attempts" }, 
          { status: 429 }
        );
      }
      
      // Get session
      const session = await auth();
      
      // Check if user is authenticated
      if (!session || !session.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Add user info to request for downstream handlers
      // In a real implementation, you might want to use a more sophisticated method
      
      // Continue to the next middleware or route handler
      return NextResponse.next();
    } catch (error) {
      console.error('Enhanced auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Enhanced role-based access control middleware
 * @param requiredRole - The required role
 */
export async function withEnhancedRole(requiredRole: Role) {
  return async function middleware(request: NextRequest) {
    try {
      // Apply Arcjet protection
      const decision = await ajAuth.protect(request, { userId: "anonymous" });
      
      if (decision.isDenied()) {
        return NextResponse.json(
          { error: "Too many requests" }, 
          { status: 429 }
        );
      }
      
      // Get session
      const session = await auth();
      
      // Check if user is authenticated
      if (!session || !session.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Check if user has required role
      const userRole = session.user.role as Role;
      if (userRole !== requiredRole) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      // Continue to the next middleware or route handler
      return NextResponse.next();
    } catch (error) {
      console.error('Enhanced RBAC middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Enhanced permission-based access control middleware
 * @param requiredPermission - The required permission
 */
export async function withEnhancedPermission(requiredPermission: Permission) {
  return async function middleware(request: NextRequest) {
    try {
      // Apply Arcjet protection
      const decision = await ajAuth.protect(request, { userId: "anonymous" });
      
      if (decision.isDenied()) {
        return NextResponse.json(
          { error: "Too many requests" }, 
          { status: 429 }
        );
      }
      
      // Get session
      const session = await auth();
      
      // Check if user is authenticated
      if (!session || !session.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Check if user has required permission
      const userRole = session.user.role as Role;
      if (!hasEnhancedPermission(userRole, requiredPermission)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      // Continue to the next middleware or route handler
      return NextResponse.next();
    } catch (error) {
      console.error('Enhanced permission middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Input validation and sanitization middleware
 * @param schema - Validation schema (simplified for this example)
 */
export function withInputValidation(schema?: any) {
  return async function middleware(request: NextRequest) {
    try {
      // Only validate POST, PUT, PATCH requests
      if (!['POST', 'PUT', 'PATCH'].includes(request.method || '')) {
        return NextResponse.next();
      }
      
      // Parse request body
      let body;
      try {
        body = await request.json();
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }
      
      // Basic sanitization - remove potentially dangerous properties
      const sanitizedBody = sanitizeInput(body);
      
      // Validate against schema if provided
      // This is a simplified validation - in a real app, you'd use a validation library like Zod
      if (schema && schema.validate) {
        const isValid = schema.validate(sanitizedBody);
        if (!isValid) {
          return NextResponse.json(
            { error: 'Invalid input data' },
            { status: 400 }
          );
        }
      }
      
      // Continue to the next middleware or route handler
      return NextResponse.next();
    } catch (error) {
      console.error('Input validation middleware error:', error);
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
  };
}

/**
 * Sanitize input to prevent XSS and other attacks
 * @param input - Input to sanitize
 * @returns Sanitized input
 */
function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Basic XSS prevention
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  } else if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  } else if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Prevent prototype pollution
      if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
        sanitized[key] = sanitizeInput(value);
      }
    }
    return sanitized;
  }
  return input;
}

/**
 * IP-based access control middleware
 * @param allowedIps - Array of allowed IP addresses or CIDR ranges
 */
export function withIpAccessControl(allowedIps: string[] = []) {
  return async function middleware(request: NextRequest) {
    try {
      // If no IPs are specified, allow all (for development)
      if (allowedIps.length === 0) {
        return NextResponse.next();
      }
      
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      
      // Check if IP is allowed
      const isAllowed = allowedIps.some(allowedIp => {
        // Simple IP matching (in production, you'd want proper CIDR matching)
        return ip === allowedIp || allowedIp === '*';
      });
      
      if (!isAllowed) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
      
      // Continue to the next middleware or route handler
      return NextResponse.next();
    } catch (error) {
      console.error('IP access control middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export default {
  hasEnhancedPermission,
  withEnhancedAuth,
  withEnhancedRole,
  withEnhancedPermission,
  withInputValidation,
  withIpAccessControl
};