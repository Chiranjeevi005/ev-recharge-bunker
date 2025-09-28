import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";
import { MongoClient, ObjectId } from "mongodb";
import { connectToDatabase } from "./db/connection";
import { MongoDBAdapter } from "./db/adapter";

// Extend the built-in types to add role and id
declare module "@auth/core/types" {
  export interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      role?: string;
    }
  }
  
  export interface User {
    role?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter() as Adapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For NextAuth v5, credentials are passed as the first parameter
        // Let's log the entire credentials object to see what we're getting
        console.log("Admin credentials object:", credentials);
        
        // Extract email and password - handling different possible formats
        const email = credentials?.email || (credentials as any)?.body?.email;
        const password = credentials?.password || (credentials as any)?.body?.password;

        // Validate input
        if (!email || !password) {
          console.log("Missing email or password");
          return null;
        }

        // Check if credentials match the single admin account
        const isAdmin = email === "admin@ebunker.com" && password === "admin123";

        if (!isAdmin) {
          console.log("Invalid admin credentials");
          return null;
        }

        // Check if admin user exists in database, create if not
        const { db } = await connectToDatabase();
        let admin = await db.collection("admins").findOne({ email: "admin@ebunker.com" });

        if (!admin) {
          // Hash the password
          const hashedPassword = await bcrypt.hash("admin123", 12);
          
          // Create the admin user
          const result = await db.collection("admins").insertOne({
            email: "admin@ebunker.com",
            hashedPassword,
            role: "admin",
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          admin = await db.collection("admins").findOne({ _id: result.insertedId });
        }

        if (!admin) {
          console.log("Failed to find or create admin");
          return null;
        }

        console.log("Admin authentication successful");
        return {
          id: admin._id.toString(),
          email: admin.email,
          role: admin.role,
        };
      }
    }),
    Credentials({
      id: "client-credentials",
      name: "Client Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For NextAuth v5, credentials are passed as the first parameter
        // Let's log the entire credentials object to see what we're getting
        console.log("Client credentials object:", credentials);
        
        // Extract email and password - handling different possible formats
        const email = credentials?.email || (credentials as any)?.body?.email;
        const password = credentials?.password || (credentials as any)?.body?.password;
        
        // Validate input
        if (!email || !password) {
          console.log("Missing email or password");
          return null;
        }

        // Find client by email
        const { db } = await connectToDatabase();
        const client = await db.collection("clients").findOne({ email });

        if (!client) {
          console.log("Client not found");
          return null;
        }

        // For email/password clients, check if they have a credentials-type googleId
        // In our implementation, clients with googleId starting with "credentials-" are email/password clients
        if (!client.googleId?.startsWith("credentials-")) {
          console.log("Client is not a credentials-type client");
          // This is a Google OAuth client, they can't use password auth
          return null;
        }

        // For email/password clients, we'll check the Account record to verify the password
        // First, check if an account already exists for this client
        const existingAccount = await db.collection("accounts").findOne({
          userId: client._id.toString(),
          provider: "credentials"
        });

        if (!existingAccount) {
          console.log("No account found for client");
          // This shouldn't happen - email/password clients should have an account
          return null;
        } else {
          // Check if the provided password matches
          // In a real implementation, you would compare hashed passwords
          if (existingAccount.access_token !== password) {
            console.log("Password mismatch");
            return null; // Password doesn't match
          }
        }

        // Return the client user object
        console.log("Client authentication successful");
        return {
          id: client._id.toString(),
          email: client.email,
          name: client.name,
          role: client.role,
        };
      }
    })

  ],
  callbacks: {
    async session({ session, token }) {
      // If the token exists, add the role and id to the session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      // If user exists, add role to the token
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});