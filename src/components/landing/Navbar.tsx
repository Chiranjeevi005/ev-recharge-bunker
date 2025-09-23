"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
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
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Logo variant="navbar" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link href="/dashboard/client" className="text-[#CBD5E1] hover:text-white transition-colors text-sm lg:text-base">
              Dashboard
            </Link>
            <Link href="#map" className="text-[#CBD5E1] hover:text-white transition-colors text-sm lg:text-base">
              Find Bunks
            </Link>
            <Link href="#history" className="text-[#CBD5E1] hover:text-white transition-colors text-sm lg:text-base">
              Payments
            </Link>
          </div>

          {/* Profile Dropdown */}
          <div className="hidden md:block relative">
            {session?.user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-[#CBD5E1] text-xs sm:text-sm max-w-[100px] sm:max-w-[150px] truncate">
                  Welcome, {session.user.name || session.user.email}
                </div>
                <div className="relative group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-pointer">
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute right-0 mt-1 w-40 sm:w-48 bg-[#1E293B] border border-[#334155] rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link 
                      href="/dashboard/client" 
                      className="block px-3 py-2 text-xs sm:text-sm text-[#CBD5E1] hover:bg-[#334155] hover:text-white"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/profile" 
                      className="block px-3 py-2 text-xs sm:text-sm text-[#CBD5E1] hover:bg-[#334155] hover:text-white"
                    >
                      Profile Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-xs sm:text-sm text-[#CBD5E1] hover:bg-[#334155] hover:text-white"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 10px rgba(139, 92, 246, 0.5), 0 0 15px rgba(16, 185, 129, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/register">
                    <Button 
                      variant="outline" 
                      className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-gradient-to-r hover:from-[#8B5CF6]/20 hover:to-[#10B981]/20 text-white text-xs sm:text-sm"
                      size="sm"
                    >
                      Register
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 10px rgba(139, 92, 246, 0.5), 0 0 15px rgba(16, 185, 129, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-gradient-to-r hover:from-[#8B5CF6]/20 hover:to-[#10B981]/20 text-white text-xs sm:text-sm"
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
              className="text-[#CBD5E1] hover:text-white focus:outline-none p-1 sm:p-2"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="px-3 py-2 sm:px-4 sm:py-3 space-y-1">
              <Link 
                href="/dashboard/client" 
                className="block px-3 py-2 rounded-md text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="#map" 
                className="block px-3 py-2 rounded-md text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Bunks
              </Link>
              <Link 
                href="#history" 
                className="block px-3 py-2 rounded-md text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Payments
              </Link>
              
              <div className="pt-2 pb-1 border-t border-[#334155]/50 mt-1">
                {session?.user ? (
                  <div className="space-y-1">
                    <Link 
                      href="/profile" 
                      className="block px-3 py-2 rounded-md text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md bg-gradient-to-r from-[#EF4444] to-[#F87171] text-white font-medium text-sm"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link 
                      href="/register" 
                      className="block w-full text-center px-3 py-2 rounded-md bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white font-medium text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                    <Link 
                      href="/login" 
                      className="block w-full text-center px-3 py-2 rounded-md bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white font-medium text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};