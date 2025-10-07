"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminInfo() {
  const router = useRouter();
  const [showCredentials, setShowCredentials] = useState(false);

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
            Admin Access
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#94A3B8] text-sm sm:text-base"
          >
            Information for authorized administrators only
          </motion.p>
        </div>

        <Card className="bg-[#1E293B]/80 backdrop-blur-xl border border-[#334155] shadow-2xl shadow-[#000000]/20 p-6 sm:p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#F1F5F9] mb-2">Administrator Credentials</h2>
              <p className="text-[#94A3B8] text-sm">
                For security reasons, administrator credentials should be managed through proper authentication channels.
              </p>
            </div>

            <div className="bg-[#334155]/50 border border-[#475569] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-[#F1F5F9]">Credentials Information</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCredentials(!showCredentials)}
                >
                  {showCredentials ? "Hide" : "Show"}
                </Button>
              </div>
              
              {showCredentials ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Email</p>
                    <p className="text-[#10B981] font-medium">admin@ebunker.com</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Password</p>
                    <p className="text-[#10B981] font-medium">[REDACTED FOR SECURITY]</p>
                  </div>
                </div>
              ) : (
                <p className="text-[#94A3B8] text-sm italic">
                  Credentials are hidden for security. Contact system administrator for access.
                </p>
              )}
            </div>

            <div className="bg-red-900/20 border border-red-900/30 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-medium text-red-400 mb-1">Security Notice</h3>
                  <p className="text-red-400 text-sm">
                    Never share administrator credentials. All access is logged and monitored for security purposes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => router.push("/login")}
                className="flex-1"
              >
                Back to Login
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1"
              >
                Home Page
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}