"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { motion } from "framer-motion";

// Updated component name to avoid confusion
export default function AdminInfoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] opacity-10 blur-3xl"></div>
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
            className="flex justify-center mb-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center">
              <span className="text-white font-bold text-2xl">EV</span>
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#10B981]"
          >
            EV Bunker
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#CBD5E1] mt-2"
          >
            Power the Future of Electric Mobility
          </motion.p>
        </div>
        
        <Card className="w-full backdrop-blur-xl bg-[#1E293B]/80 border border-[#475569]/50">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-[#F1F5F9] mb-2">Admin Access</h2>
            <p className="text-center text-[#94A3B8] mb-8">
              Only one admin account is allowed for this system
            </p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-[#334155]/50 border border-[#475569] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#F1F5F9] mb-3">Admin Credentials</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#94A3B8]">Email:</p>
                    <p className="text-[#8B5CF6] font-medium">admin@ebunker.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8]">Password:</p>
                    <p className="text-[#10B981] font-medium">admin123</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4">
                <p className="text-sm text-blue-400">
                  <span className="font-medium">Note:</span> Only one admin account is permitted for security reasons. 
                  Please use the credentials above to access the admin dashboard.
                </p>
              </div>
              
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white hover:from-[#7C3AED] hover:to-[#059669]"
              >
                Go to Login
              </Button>
            </motion.div>
          </div>
        </Card>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-[#94A3B8]"
        >
          <p>© {new Date().getFullYear()} EV Bunker. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}