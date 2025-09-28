const { MongoClient } = require('mongodb');

async function createTestClient() {
  const uri = "mongodb+srv://chiru:chiru@cluster0.yylyjss.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db('ev_bunker'); // Replace with your database name if different
    
    // Check if client already exists
    const existingClient = await db.collection("clients").findOne({ email: "test@example.com" });
    
    if (existingClient) {
      console.log("Test client already exists");
      return;
    }

    // Create the client with a unique googleId for email/password clients
    const clientResult = await db.collection("clients").insertOne({
      name: "Test User",
      email: "test@example.com",
      googleId: `credentials-${Date.now()}-${Math.floor(Math.random() * 10000)}`, // Unique googleId for email/password client
      role: "client",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const createdClient = await db.collection("clients").findOne({ _id: clientResult.insertedId });

    // Create an account record to store the password
    await db.collection("accounts").insertOne({
      userId: createdClient._id.toString(),
      type: "credentials",
      provider: "credentials",
      providerAccountId: createdClient._id.toString(),
      access_token: "password123", // In a real implementation, this should be hashed
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Test client created successfully");
    console.log("Email: test@example.com");
    console.log("Password: password123");
  } catch (error) {
    console.error("Error creating test client:", error);
  } finally {
    await client.close();
  }
}

createTestClient();