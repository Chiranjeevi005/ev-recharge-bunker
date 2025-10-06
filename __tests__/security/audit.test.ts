import { logSecurityEvent, getSecurityAuditLogs, performSecurityAudit } from '@/lib/security/audit';

// Mock the database connection
jest.mock('@/lib/db', () => ({
  connectToDatabase: jest.fn().mockResolvedValue({
    db: {
      collection: jest.fn().mockReturnValue({
        insertOne: jest.fn().mockResolvedValue({}),
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([])
              })
            })
          })
        }),
        countDocuments: jest.fn().mockResolvedValue(0)
      })
    }
  })
}));

describe('Security Audit', () => {
  describe('logSecurityEvent', () => {
    it('should log a security event', async () => {
      const logEntry = {
        action: 'TEST_ACTION',
        resource: 'test_resource',
        severity: 'low' as const,
        details: { test: 'data' }
      };
      
      await expect(logSecurityEvent(logEntry)).resolves.not.toThrow();
    });
  });
  
  describe('getSecurityAuditLogs', () => {
    it('should retrieve security audit logs', async () => {
      const result = await getSecurityAuditLogs();
      expect(result).toEqual({ logs: [], total: 0 });
    });
  });
  
  describe('performSecurityAudit', () => {
    it('should perform a security audit without errors', async () => {
      await expect(performSecurityAudit()).resolves.not.toThrow();
    });
  });
});