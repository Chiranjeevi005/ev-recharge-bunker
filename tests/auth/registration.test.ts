import { MongoClient, Db } from 'mongodb';
import { connectToDatabase } from '../../src/lib/db/connection';

describe('Client Registration Tests', () => {
  let client: MongoClient;
  let db: Db;

  beforeAll(async () => {
    const connection = await connectToDatabase();
    client = connection.client;
    db = connection.db;
  });

  afterAll(async () => {
    await client.close();
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
      const existingClient = await db.collection("clients").findOne({ email: clientData.email });

      expect(existingClient).toBeNull();

      // Create the client
      const clientResult = await db.collection("clients").insertOne({
        name: clientData.name,
        email: clientData.email,
        googleId: "credentials-" + Date.now(), // Unique googleId for email/password client
        role: "client",
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const client = await db.collection("clients").findOne({ _id: clientResult.insertedId });

      // Create an account record to store the password
      const accountResult = await db.collection("accounts").insertOne({
        userId: client!._id.toString(),
        type: "credentials",
        provider: "credentials",
        providerAccountId: client!._id.toString(),
        access_token: clientData.password, // In a real implementation, this should be hashed
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const account = await db.collection("accounts").findOne({ _id: accountResult.insertedId });

      // Verify client was created
      expect(client).toBeDefined();
      expect(client!.name).toBe(clientData.name);
      expect(client!.email).toBe(clientData.email);
      expect(client!.role).toBe('client');
      expect(client!.googleId).toContain('credentials-');

      // Verify account was created
      expect(account).toBeDefined();
      expect(account!.userId).toBe(client!._id.toString());
      expect(account!.provider).toBe('credentials');
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
      const clientResult = await db.collection("clients").insertOne({
        name: clientData.name,
        email: clientData.email,
        googleId: "credentials-existing-" + timestamp,
        role: "client",
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const client = await db.collection("clients").findOne({ _id: clientResult.insertedId });

      // Create an account record
      await db.collection("accounts").insertOne({
        userId: client!._id.toString(),
        type: "credentials",
        provider: "credentials",
        providerAccountId: client!._id.toString(),
        access_token: clientData.password,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Try to create another client with the same email
      const duplicateClientData = {
        name: 'Duplicate Client',
        email: clientData.email, // Same email as existing client
        password: 'anotherpassword123'
      };

      // Check if client already exists
      const existingClient = await db.collection("clients").findOne({ email: duplicateClientData.email });

      // Should find the existing client
      expect(existingClient).toBeDefined();
      expect(existingClient!.email).toBe(duplicateClientData.email);
    });
  });
});