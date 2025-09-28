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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check if credentials match the single admin account
        const isAdmin = credentials.email === "admin@ebunker.com" && credentials.password === "admin123";

        if (!isAdmin) {
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
          return null;
        }

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
        // Extract email and password - handling different possible formats in NextAuth v5
        const email = (credentials as any)?.email || (credentials as any)?.credentials?.email || (credentials as any)?.body?.email;
        const password = (credentials as any)?.password || (credentials as any)?.credentials?.password || (credentials as any)?.body?.password;
        
        // Validate input
        if (!email || !password) {
          return null;
        }

        // Find client by email
        const { db } = await connectToDatabase();
        const client = await db.collection("clients").findOne({ email });

        if (!client) {
          return null;
        }

        // For email/password clients, check if they have a credentials-type googleId
        // In our implementation, clients with googleId starting with "credentials-" are email/password clients
        if (!client.googleId?.startsWith("credentials-")) {
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
          // This shouldn't happen - email/password clients should have an account
          return null;
        } else {
          // Check if the provided password matches
          // In a real implementation, you would compare hashed passwords
          if (existingAccount.access_token !== password) {
            return null; // Password doesn't match
          }
        }

        // Return the client user object
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