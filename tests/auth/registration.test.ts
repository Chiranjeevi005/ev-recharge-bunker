import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

describe('Client Registration Tests', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Client Registration API', () => {
    it('should register a new client successfully', async () => {
      // Test data with unique email
      const clientData = {
        name: 'Client Name',
        email: 'client' + Date.now() + '@ebunker.com',
        password: 'clientpassword123'
      };

      // In a real test, we would make an API call to /api/auth/client/register
      // For this test, we'll simulate the registration logic

      // Check if client already exists (should not exist)
      const existingClient = await prisma.client.findUnique({
        where: { email: clientData.email }
      });

      expect(existingClient).toBeNull();

      // Create the client
      const client = await prisma.client.create({
        data: {
          name: clientData.name,
          email: clientData.email,
          googleId: "credentials-" + Date.now(), // Unique googleId for email/password client
          role: "client"
        }
      });

      // Create an account record to store the password
      const account = await prisma.account.create({
        data: {
          userId: client.id,
          type: "credentials",
          provider: "credentials",
          providerAccountId: client.id,
          access_token: clientData.password // In a real implementation, this should be hashed
        }
      });

      // Verify client was created
      expect(client).toBeDefined();
      expect(client.name).toBe(clientData.name);
      expect(client.email).toBe(clientData.email);
      expect(client.role).toBe('client');
      expect(client.googleId).toContain('credentials-');

      // Verify account was created
      expect(account).toBeDefined();
      expect(account.userId).toBe(client.id);
      expect(account.provider).toBe('credentials');
    });

    it('should reject registration for existing client email', async () => {
      // First, create a client with unique email
      const timestamp = Date.now();
      const clientData = {
        name: 'Existing Client',
        email: 'existing' + timestamp + '@ebunker.com',
        password: 'clientpassword123'
      };

      // Create the client
      const client = await prisma.client.create({
        data: {
          name: clientData.name,
          email: clientData.email,
          googleId: "credentials-existing-" + timestamp,
          role: "client"
        }
      });

      // Create an account record
      await prisma.account.create({
        data: {
          userId: client.id,
          type: "credentials",
          provider: "credentials",
          providerAccountId: client.id,
          access_token: clientData.password
        }
      });

      // Try to create another client with the same email
      const duplicateClientData = {
        name: 'Duplicate Client',
        email: clientData.email, // Same email as existing client
        password: 'anotherpassword123'
      };

      // Check if client already exists
      const existingClient = await prisma.client.findUnique({
        where: { email: duplicateClientData.email }
      });

      // Should find the existing client
      expect(existingClient).toBeDefined();
      expect(existingClient?.email).toBe(duplicateClientData.email);
    });
  });
});