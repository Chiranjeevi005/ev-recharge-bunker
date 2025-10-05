"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";

interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use next-auth/react to get session
        const session = await fetch("/api/auth/session").then(res => res.json());
        
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, userType: 'admin' | 'client' = 'client') => {
    try {
      // Use next-auth/react signIn function
      const result = await signIn(`${userType}-credentials`, {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      } else {
        // Refresh the user data
        const session = await fetch("/api/auth/session").then(res => res.json());
        if (session?.user) {
          setUser(session.user);
        }
        router.push(userType === 'admin' ? "/dashboard/admin" : "/dashboard/client");
        return { success: true };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
  };
}