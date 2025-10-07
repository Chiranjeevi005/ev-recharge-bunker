import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";
import { MongoClient, ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/db/connection";
import { MongoDBAdapter } from "@/lib/db/adapter";

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

        // Return the admin user object
        console.log("Admin authentication successful");
        return {
          id: "admin",
          email: "admin@ebunker.com",
          role: "admin",
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

        // For email/password clients, check if they have a credentials-type identifier
        // In our implementation, clients with googleId starting with "credentials-" are email/password clients
        if (!client['googleId']?.startsWith("credentials-")) {
          console.log("Client is not a credentials-type client");
          // This is an OAuth client, they can't use password auth
          return null;
        }

        // For email/password clients, we'll check the Account record to verify the password
        // First, check if an account already exists for this client
        const existingAccount = await db.collection("accounts").findOne({
          userId: client._id.toString(),
          provider: "client-credentials"
        });

        if (!existingAccount) {
          console.log("No account found for client");
          // This shouldn't happen - email/password clients should have an account
          return null;
        } else {
          // Check if the provided password matches
          // In a real implementation, you would compare hashed passwords
          if (existingAccount['access_token'] !== password) {
            console.log("Password mismatch");
            return null; // Password doesn't match
          }
        }

        // Return the client user object
        console.log("Client authentication successful");
        return {
          id: client._id.toString(),
          email: client['email'],
          name: client['name'],
          role: client['role'],
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
        if (user.role) {
          token.role = user.role;
        }
        if (user.id) {
          token.id = user.id;
        }
      }
      return token;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    // Configure session timeout and refresh
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env['AUTH_SECRET'] || "default_secret_key",
  // Add custom session management
  events: {
    async signIn({ user, account, profile }) {
      console.log("User signed in:", user.id);
    },
    async signOut() {
      console.log("User signed out");
    },
  },
});