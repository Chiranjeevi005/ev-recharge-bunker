"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { signOut, useSession } from "next-auth/react";

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      window.location.href = "/"; // Redirect to home page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1E293B]/80 backdrop-blur-md border-b border-[#334155]/50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center">
              <span className="text-white font-bold text-sm">EV</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hidden sm:block">
              EV Bunker
            </span>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#10B981] block sm:hidden">
              EV
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link href="/" className="text-[#CBD5E1] hover:text-white transition-colors text-sm lg:text-base">
              Home
            </Link>
            <Link href="#features" className="text-[#CBD5E1] hover:text-white transition-colors text-sm lg:text-base">
              Features
            </Link>
            <Link href="#how-it-works" className="text-[#CBD5E1] hover:text-white transition-colors text-sm lg:text-base">
              How It Works
            </Link>
            <Link href="#stations" className="text-[#CBD5E1] hover:text-white transition-colors text-sm lg:text-base">
              Stations
            </Link>
            
            {/* Dashboard link for authenticated users */}
            {session?.user && (
              <Link 
                href={session.user.role === "admin" ? "/dashboard/admin" : "/dashboard/client"} 
                className="text-[#8B5CF6] hover:text-[#A78BFA] transition-colors font-medium text-sm lg:text-base"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Login/Logout Button - Glassmorphism with gradient hover glow */}
          <div className="hidden md:block">
            {session?.user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-gradient-to-r hover:from-[#EF4444]/20 hover:to-[#F87171]/20 text-white text-sm lg:text-base"
                  size="sm"
                >
                  Logout
                </Button>
              </motion.div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(139, 92, 246, 0.5), 0 0 30px rgba(16, 185, 129, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/register">
                    <Button 
                      variant="outline" 
                      className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-gradient-to-r hover:from-[#8B5CF6]/20 hover:to-[#10B981]/20 text-white text-sm lg:text-base"
                      size="sm"
                    >
                      Register
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(139, 92, 246, 0.5), 0 0 30px rgba(16, 185, 129, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-gradient-to-r hover:from-[#8B5CF6]/20 hover:to-[#10B981]/20 text-white text-sm lg:text-base"
                      size="sm"
                    >
                      Login
                    </Button>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#CBD5E1] hover:text-white focus:outline-none p-2"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1E293B] border-t border-[#334155]/50"
          >
            <div className="px-4 py-3 space-y-2">
              <Link 
                href="/" 
                className="block px-3 py-2 rounded-md text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="#features" 
                className="block px-3 py-2 rounded-md text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#how-it-works" 
                className="block px-3 py-2 rounded-md text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                href="#stations" 
                className="block px-3 py-2 rounded-md text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                Stations
              </Link>
              
              {/* Dashboard link for authenticated users on mobile */}
              {session?.user && (
                <Link 
                  href={session.user.role === "admin" ? "/dashboard/admin" : "/dashboard/client"} 
                  className="block px-3 py-2 rounded-md text-[#8B5CF6] hover:text-[#A78BFA] hover:bg-[#334155]/50 font-medium text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              
              <div className="pt-3 pb-2 border-t border-[#334155]/50 mt-2">
                {session?.user ? (
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-center px-3 py-2.5 rounded-md bg-gradient-to-r from-[#EF4444] to-[#F87171] text-white font-medium text-base"
                  >
                    Logout
                  </button>
                ) : (
                  <Link 
                    href="/register" 
                    className="block w-full text-center px-3 py-2.5 rounded-md bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white font-medium text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};