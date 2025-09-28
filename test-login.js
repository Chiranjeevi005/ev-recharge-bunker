const { MongoClient } = require('mongodb');

async function testLogin() {
  const uri = "mongodb+srv://chiru:chiru@cluster0.yylyjss.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db('ev_bunker'); // Replace with your database name if different
    
    // Find the client
    const clientUser = await db.collection("clients").findOne({ email: "test@example.com" });
    
    if (!clientUser) {
      console.log("Test client not found");
      return;
    }

    console.log("Client found:", clientUser);

    // Find the account
    const account = await db.collection("accounts").findOne({
      userId: clientUser._id.toString(),
      provider: "credentials"
    });

    if (!account) {
      console.log("Account not found");
      return;
    }

    console.log("Account found:", account);
    console.log("Stored password (access_token):", account.access_token);
    
    // Test authentication logic
    const email = "test@example.com";
    const password = "password123";
    
    console.log("Testing login with:");
    console.log("Email:", email);
    console.log("Password:", password);
    
    if (account.access_token === password) {
      console.log("✅ Authentication would succeed!");
    } else {
      console.log("❌ Authentication would fail!");
      console.log("Expected:", account.access_token);
      console.log("Provided:", password);
    }
  } catch (error) {
    console.error("Error testing login:", error);
  } finally {
    await client.close();
  }
}

testLogin();