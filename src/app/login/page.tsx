"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLoader } from "@/context/LoaderContext";
// We'll move useRouteTransition to a separate component wrapped in Suspense
// import { useRouteTransition } from '@/hooks/useRouteTransition';

// Loading component for Suspense
function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5CF6] mb-4"></div>
        <p className="text-[#CBD5E1]">Loading...</p>
      </div>
    </div>
  );
}

function LoginContent() {
  const [activeTab, setActiveTab] = useState<"admin" | "client">("client"); // Changed default to client
  const [adminCredentials, setAdminCredentials] = useState({
    email: "",
    password: "",
  });
  const [clientCredentials, setClientCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const { showLoader, hideLoader } = useLoader();
  
  // Initialize route transition handler
  // We'll move this to a separate component that's wrapped in Suspense
  // useRouteTransition();

  // Focus on email field when tab is selected and pre-fill email from query params
  useEffect(() => {
    // Pre-fill email from query params if available
    const emailParam = searchParams?.get('email') || null;
    if (emailParam) {
      if (activeTab === "client") {
        setClientCredentials(prev => ({
          ...prev,
          email: emailParam
        }));
      } else {
        setAdminCredentials(prev => ({
          ...prev,
          email: emailParam
        }));
      }
    }
    
    // Focus on email field when tab is selected
    if (((activeTab === "admin" || activeTab === "client") && emailRef.current)) {
      emailRef.current.focus();
    }
  }, [activeTab, searchParams]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    showLoader("Signing in as admin...");
    setError(null);

    try {
      // Sign in with email and password for admin
      const result = await signIn("admin-credentials", {
        email: adminCredentials.email.trim(),
        password: adminCredentials.password.trim(),
        redirect: false,
        callbackUrl: "/dashboard/admin",
      });

      if (result?.error) {
        setError("Invalid admin credentials. Please check your credentials and try again.");
        hideLoader();
      } else {
        // Set flag to show loading screen after login
        localStorage.setItem('showLoadingAfterLogin', 'true');
        // Hide loader before redirect
        hideLoader();
        // Small delay to ensure state is properly set
        setTimeout(() => {
          // Redirect to admin dashboard after successful login
          router.push("/dashboard/admin");
          router.refresh(); // Refresh to update navbar
        }, 100);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      hideLoader();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    showLoader("Signing in...");
    setError(null);

    try {
      // Sign in with email and password for clients
      const result = await signIn("client-credentials", {
        email: clientCredentials.email.trim(),
        password: clientCredentials.password.trim(),
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError("Invalid email or password. Please check your credentials and try again.");
        hideLoader();
      } else {
        // Set flag to show loading screen after login
        localStorage.setItem('showLoadingAfterLogin', 'true');
        // Hide loader before redirect
        hideLoader();
        // Small delay to ensure state is properly set
        setTimeout(() => {
          // Redirect to home page after successful login
          router.push("/");
          router.refresh(); // Refresh to update navbar
        }, 100);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      hideLoader();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] opacity-10 blur-3xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#10B981] mb-4"
          >
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mb-2"
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#94A3B8] text-sm sm:text-base"
          >
            Sign in to your account to continue
          </motion.p>
        </div>

        <Card className="bg-[#1E293B]/80 backdrop-blur-xl border border-[#334155] shadow-2xl shadow-[#000000]/20 p-6 sm:p-8">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#334155] mb-8">
            <button
              onClick={() => setActiveTab("client")}
              className={`flex-1 py-4 px-4 text-center font-medium transition-colors duration-200 ${
                activeTab === "client"
                  ? "text-[#10B981] border-b-2 border-[#10B981]"
                  : "text-[#94A3B8] hover:text-[#CBD5E1]"
              }`}
            >
              Client Login
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-4 px-4 text-center font-medium transition-colors duration-200 ${
                activeTab === "admin"
                  ? "text-[#10B981] border-b-2 border-[#10B981]"
                  : "text-[#94A3B8] hover:text-[#CBD5E1]"
              }`}
            >
              Admin Login
            </button>
          </div>

          {/* Admin Login Form */}
          {activeTab === "admin" && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleAdminLogin}
              className="space-y-6"
            >
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-[#CBD5E1] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    ref={emailRef}
                    id="admin-email"
                    type="email"
                    value={adminCredentials.email}
                    onChange={(e) =>
                      setAdminCredentials({
                        ...adminCredentials,
                        email: e.target.value,
                      })
                    }
                    onBlur={(e) =>
                      setAdminCredentials({
                        ...adminCredentials,
                        email: e.target.value.trim(),
                      })
                    }
                    className="w-full pl-10 pr-3 py-3 sm:py-4 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder-[#94A3B8] transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-[#CBD5E1] mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="admin-password"
                    type="password"
                    value={adminCredentials.password}
                    onChange={(e) =>
                      setAdminCredentials({
                        ...adminCredentials,
                        password: e.target.value,
                      })
                    }
                    onBlur={(e) =>
                      setAdminCredentials({
                        ...adminCredentials,
                        password: e.target.value.trim(),
                      })
                    }
                    className="w-full pl-10 pr-3 py-3 sm:py-4 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder-[#94A3B8] transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm bg-red-900/20 p-4 rounded-lg border border-red-900/30"
                >
                  {error}
                </motion.div>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign In as Admin"
                )}
              </Button>
            </motion.form>
          )}

          {/* Client Login Form */}
          {activeTab === "client" && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleClientLogin}
              className="space-y-6"
            >
              <div>
                <label htmlFor="client-email" className="block text-sm font-medium text-[#CBD5E1] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    ref={emailRef}
                    id="client-email"
                    type="email"
                    value={clientCredentials.email}
                    onChange={(e) =>
                      setClientCredentials({
                        ...clientCredentials,
                        email: e.target.value,
                      })
                    }
                    onBlur={(e) =>
                      setClientCredentials({
                        ...clientCredentials,
                        email: e.target.value.trim(),
                      })
                    }
                    className="w-full pl-10 pr-3 py-3 sm:py-4 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder-[#94A3B8] transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="client-password" className="block text-sm font-medium text-[#CBD5E1] mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="client-password"
                    type="password"
                    value={clientCredentials.password}
                    onChange={(e) =>
                      setClientCredentials({
                        ...clientCredentials,
                        password: e.target.value,
                      })
                    }
                    onBlur={(e) =>
                      setClientCredentials({
                        ...clientCredentials,
                        password: e.target.value.trim(),
                      })
                    }
                    className="w-full pl-10 pr-3 py-3 sm:py-4 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder-[#94A3B8] transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm bg-red-900/20 p-4 rounded-lg border border-red-900/30"
                >
                  {error}
                </motion.div>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.form>
          )}
          
          <div className="text-center text-sm text-[#94A3B8] mt-8 pt-6 border-t border-[#334155]">
            <p>Don't have an account?{" "}
              <Link href="/register" className="text-[#10B981] hover:text-[#6EE7B7] font-medium transition-colors duration-200">
                Register now
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginContent />
    </Suspense>
  );
}