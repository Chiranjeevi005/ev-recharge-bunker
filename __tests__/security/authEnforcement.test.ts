/**
 * @jest-environment node
 */

describe('Auth Enforcement', () => {
  // Import the functions dynamically to avoid module resolution issues
  let hasEnhancedPermission: any;
  
  beforeAll(async () => {
    const module = await import('@/lib/security/authEnforcement');
    hasEnhancedPermission = module.hasEnhancedPermission;
  });

  describe('hasEnhancedPermission', () => {
    it('should return true for admin role with any permission', () => {
      expect(hasEnhancedPermission('admin', 'read:clients')).toBe(true);
      expect(hasEnhancedPermission('admin', 'write:stations')).toBe(true);
      expect(hasEnhancedPermission('admin', 'read:audit_logs')).toBe(true);
    });
    
    it('should return true for client role with allowed permissions', () => {
      expect(hasEnhancedPermission('client', 'read:clients')).toBe(true);
      expect(hasEnhancedPermission('client', 'read:stations')).toBe(true);
      expect(hasEnhancedPermission('client', 'read:payments')).toBe(true);
      expect(hasEnhancedPermission('client', 'read:bookings')).toBe(true);
      expect(hasEnhancedPermission('client', 'write:bookings')).toBe(true);
    });
    
    it('should return false for client role with disallowed permissions', () => {
      expect(hasEnhancedPermission('client', 'write:clients')).toBe(false);
      expect(hasEnhancedPermission('client', 'write:stations')).toBe(false);
      expect(hasEnhancedPermission('client', 'write:payments')).toBe(false);
      expect(hasEnhancedPermission('client', 'read:audit_logs')).toBe(false);
      expect(hasEnhancedPermission('client', 'write:audit_logs')).toBe(false);
    });
    
    it('should return false for unknown roles', () => {
      expect(hasEnhancedPermission('unknown' as any, 'read:clients')).toBe(false);
    });
  });
});