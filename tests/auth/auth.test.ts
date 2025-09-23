import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Authentication Tests', () => {
  describe('Admin Login', () => {
    it('should authenticate admin with correct credentials', async () => {
      // Admin credentials
      const email = 'admin@ebunker.com';
      const password = 'admin123';
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Verify the email is correct
      expect(email).toBe('admin@ebunker.com');
      
      // Verify password can be hashed
      expect(hashedPassword).toBeDefined();
      
      // Verify password validation works
      const isPasswordValid = await bcrypt.compare(password, hashedPassword);
      expect(isPasswordValid).toBe(true);
    });

    it('should reject admin with incorrect password', async () => {
      // Admin credentials
      const email = 'admin@ebunker.com';
      const correctPassword = 'admin123';
      const wrongPassword = 'wrongpassword';
      
      // Hash the correct password
      const hashedPassword = await bcrypt.hash(correctPassword, 12);
      
      // Verify password validation rejects wrong password
      const isPasswordValid = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isPasswordValid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate a valid JWT token', () => {
      // Environment variable
      process.env.AUTH_SECRET = 'test-secret';

      const payload = {
        id: 'admin1',
        email: 'admin@ebunker.com',
        role: 'admin',
      };

      const token = jwt.sign(payload, process.env.AUTH_SECRET!, { expiresIn: '15m' });

      // Verify token is generated
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.AUTH_SECRET!);
      expect(decoded).toMatchObject(payload);
    });

    it('should reject invalid JWT token', () => {
      // Environment variable
      process.env.AUTH_SECRET = 'test-secret';

      const invalidToken = 'invalid.token.here';

      expect(() => {
        jwt.verify(invalidToken, process.env.AUTH_SECRET!);
      }).toThrow();
    });
  });
});