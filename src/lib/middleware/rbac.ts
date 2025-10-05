import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

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
  | 'write:audit_logs';

// Define role permissions
const rolePermissions: Record<Role, Permission[]> = {
  client: [
    'read:clients',
    'read:stations',
    'read:payments'
  ],
  admin: [
    'read:clients',
    'write:clients',
    'read:stations',
    'write:stations',
    'read:payments',
    'write:payments',
    'read:audit_logs',
    'write:audit_logs'
  ]
};

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
}

// Middleware to check if user has required role
export async function withRole(requiredRole: Role) {
  return async function middleware(request: NextRequest) {
    try {
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
      console.error('RBAC middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Middleware to check if user has specific permission
export async function withPermission(requiredPermission: Permission) {
  return async function middleware(request: NextRequest) {
    try {
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
      if (!hasPermission(userRole, requiredPermission)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      // Continue to the next middleware or route handler
      return NextResponse.next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Input validation middleware
export function withValidation(schema: any) {
  return async function middleware(request: NextRequest) {
    try {
      // Parse request body
      const body = await request.json();
      
      // Validate against schema
      // This is a simplified validation - in a real app, you'd use a validation library like Zod
      const isValid = schema.validate ? schema.validate(body) : true;
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid input data' },
          { status: 400 }
        );
      }
      
      // Continue to the next middleware or route handler
      return NextResponse.next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
  };
}