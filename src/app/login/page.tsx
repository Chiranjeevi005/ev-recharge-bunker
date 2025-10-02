"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLoader } from "@/lib/LoaderContext";

export default function LoginPage() {
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

  // Focus on email field when tab is selected and pre-fill email from query params
  useEffect(() => {
    // Pre-fill email from query params if available
    const emailParam = searchParams.get('email');
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
      // Sign in with NextAuth credentials provider
      const result = await signIn("admin-credentials", {
        email: adminCredentials.email.trim(),
        password: adminCredentials.password.trim(),
        redirect: false,
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    showLoader("Redirecting to Google...");
    setError(null);
    
    try {
      // Set flag to show loading screen after login
      localStorage.setItem('showLoadingAfterLogin', 'true');
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      setError("Failed to initiate Google login");
      console.error(err);
      setIsLoading(false);
      hideLoader();
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
        <div className="text-center mb-6 sm:mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-3 sm:mb-4"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center">
              <span className="text-white font-bold text-xl sm:text-2xl">EV</span>
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#10B981]"
          >
            EV Bunker
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#CBD5E1] mt-1 sm:mt-2 text-sm sm:text-base"
          >
            Power the Future of Electric Mobility
          </motion.p>
        </div>
        
        <Card className="w-full backdrop-blur-xl bg-[#1E293B]/80 border border-[#475569]/50">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-[#F1F5F9] mb-2">
              {activeTab === "admin" ? "Admin Login" : "Welcome Back"}
            </h2>
            <p className="text-center text-[#94A3B8] mb-6 sm:mb-8 text-sm sm:text-base">
              {activeTab === "admin" 
                ? "Sign in to access admin dashboard" 
                : "Sign in to access your EV charging account"}
            </p>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-[#334155] mb-6 sm:mb-8">
              <button
                className={`py-2 sm:py-3 px-3 sm:px-4 font-medium text-sm relative flex-1 ${
                  activeTab === "client"
                    ? "text-[#10B981]"
                    : "text-[#94A3B8] hover:text-[#CBD5E1]"
                }`}
                onClick={() => setActiveTab("client")}
              >
                Client Login
                {activeTab === "client" && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981]"
                    layoutId="tabIndicator"
                  />
                )}
              </button>
              <button
                className={`py-2 sm:py-3 px-3 sm:px-4 font-medium text-sm relative flex-1 ${
                  activeTab === "admin"
                    ? "text-[#8B5CF6]"
                    : "text-[#94A3B8] hover:text-[#CBD5E1]"
                }`}
                onClick={() => setActiveTab("admin")}
              >
                Admin Login
                {activeTab === "admin" && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6]"
                    layoutId="tabIndicator"
                  />
                )}
              </button>
            </div>

            {/* Client Login Form */}
            {activeTab === "client" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 sm:space-y-6"
              >
                <form onSubmit={handleClientLogin}>
                  <div className="space-y-5 sm:space-y-6">
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
                          className="w-full pl-10 pr-3 py-2.5 sm:py-3 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder-[#94A3B8] transition-all duration-200 text-sm sm:text-base"
                          placeholder="Enter your email"
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
                          className="w-full pl-10 pr-3 py-2.5 sm:py-3 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder-[#94A3B8] transition-all duration-200 text-sm sm:text-base"
                          placeholder="Enter your password"
                        />
                      </div>
                    </div>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/30"
                      >
                        {error}
                      </motion.div>
                    )}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full"
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
                  </div>
                </form>
                
                <div className="relative my-5 sm:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#334155]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#1E293B] text-[#94A3B8]">Or continue with</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Redirecting...
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </Button>
                
                <div className="text-center text-sm text-[#94A3B8] mt-5 sm:mt-6">
                  <p>Don't have an account?{" "}
                    <Link href="/register" className="text-[#10B981] hover:text-[#6EE7B7] font-medium transition-colors duration-200">
                      Register now
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Admin Login Form */}
            {activeTab === "admin" && (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleAdminLogin}
              >
                <div className="space-y-5 sm:space-y-6">
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
                        className="w-full pl-10 pr-3 py-2.5 sm:py-3 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent placeholder-[#94A3B8] transition-all duration-200 text-sm sm:text-base"
                        placeholder="admin@ebunker.com"
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
                        className="w-full pl-10 pr-3 py-2.5 sm:py-3 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent placeholder-[#94A3B8] transition-all duration-200 text-sm sm:text-base"
                        placeholder="admin123"
                      />
                    </div>
                  </div>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/30"
                    >
                      {error}
                    </motion.div>
                  )}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
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
                </div>
              </motion.form>
            )}
          </div>
        </Card>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-5 sm:mt-6 text-sm text-[#94A3B8]"
        >
          <p>© {new Date().getFullYear()} EV Bunker. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}