"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { signOut, useSession } from "next-auth/react";
import Image from 'next/image';
import { useLoader } from '@/lib/LoaderContext'; // Import the universal loader context

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const router = useRouter();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null); // Added state for user name
  const { showLoader, hideLoader } = useLoader(); // Use the loader context

  // Load user avatar from localStorage or session
  useEffect(() => {
    const loadAvatar = () => {
      if (typeof window !== 'undefined') {
        // First check localStorage for saved profile
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);
            if (parsedProfile.avatar && parsedProfile.avatar !== '/assets/logo.png') {
              setUserAvatar(parsedProfile.avatar);
              return;
            }
          } catch (e) {
            console.error('Failed to parse saved profile data', e);
          }
        }
        
        // Fallback to session image
        if (session?.user?.image && session.user.image !== '/assets/logo.png') {
          setUserAvatar(session.user.image);
          return;
        }
        
        // If no custom avatar, set to null to show default
        setUserAvatar(null);
      }
    };

    loadAvatar();

    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfile') {
        loadAvatar();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [session]);

  // Load user name from localStorage or session
  useEffect(() => {
    const loadUserName = () => {
      if (typeof window !== 'undefined') {
        // First check localStorage for saved profile
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);
            if (parsedProfile.fullName) {
              setUserName(parsedProfile.fullName);
              return;
            }
          } catch (e) {
            console.error('Failed to parse saved profile data', e);
          }
        }
        
        // Fallback to session name
        if (session?.user?.name) {
          setUserName(session.user.name);
          return;
        }
        
        // Fallback to session email
        if (session?.user?.email) {
          setUserName(session.user.email);
          return;
        }
        
        // Default fallback
        setUserName(null);
      }
    };

    loadUserName();

    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfile') {
        loadUserName();
      }
    };

    // Listen for profile updates
    const handleProfileUpdate = (e: CustomEvent) => {
      if (e.detail && e.detail.fullName) {
        setUserName(e.detail.fullName);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, [session]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // For logo click, we want to navigate without showing the loading screen
    // Set flag to indicate navigation is from logo click
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('fromLogoClick', 'true');
    }
    router.push("/");
  };

  const handleLogout = async () => {
    try {
      showLoader("Logging out..."); // Show loader during logout
      
      // Clear loading screen flags from localStorage
      localStorage.removeItem('hasSeenLoadingScreen');
      localStorage.removeItem('showLoadingAfterLogin');
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile'); // Clear user profile data
      
      await signOut({ redirect: false });
      
      // Small delay to ensure state is properly set
      setTimeout(() => {
        hideLoader(); // Hide loader after logout
        window.location.href = "/"; // Redirect to home page
      }, 300);
    } catch (error) {
      console.error("Logout failed:", error);
      hideLoader(); // Hide loader even if there's an error
    }
  };

  // Handle navigation with universal loader and smooth transition
  const handleNavigation = (path: string, loadingMessage: string = "Loading page...") => {
    // Show loader immediately for better user feedback
    showLoader(loadingMessage);
    
    // Close mobile menu if open
    setIsMenuOpen(false);
    
    // For dashboard navigation, we need to ensure the loader stays visible during the entire transition
    const isDashboardNavigation = path.includes('/dashboard');
    
    if (isDashboardNavigation) {
      setTimeout(() => {
        router.push(path);
        setTimeout(() => {
          hideLoader();
        }, 800); 
      }, 100); 
    } else {
      router.push(path);
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
          {/* Logo - redirect to main page */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={handleLogoClick}
          >
            <Logo variant="navbar" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <button 
              onClick={() => handleNavigation("/find-bunks", "Finding charging stations...")}
              className="text-[#CBD5E1] hover:text-white transition-all duration-300 text-sm lg:text-base nav-item-hover"
            >
              Find Bunks
            </button>
            {/* Removed Payments nav item as it is not required */}
            <button 
              onClick={() => handleNavigation("/contact", "Loading contact page...")}
              className="text-[#CBD5E1] hover:text-white transition-all duration-300 text-sm lg:text-base nav-item-hover"
            >
              Contact
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="hidden md:block relative">
            {session?.user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* CHANGED: Direct link to dashboard instead of redirect page */}
                <button 
                  onClick={() => {
                    if (session.user?.role === "admin") {
                      handleNavigation("/dashboard/admin", "Loading admin dashboard...");
                    } else {
                      handleNavigation("/dashboard", "Loading your dashboard...");
                    }
                  }}
                  className="text-[#8B5CF6] hover:text-[#A78BFA] transition-all duration-300 text-sm font-medium nav-item-hover"
                >
                  Dashboard
                </button>
                <div className="text-[#CBD5E1] text-xs sm:text-sm max-w-[100px] sm:max-w-[150px] truncate">
                  Welcome, {userName || session.user.name || session.user.email}
                </div>
                <div className="relative group">
                  {userAvatar ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#10B981]">
                      <Image 
                        src={userAvatar} 
                        alt="Profile" 
                        width={40} 
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-pointer">
                      {userName?.charAt(0) || session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="absolute right-0 mt-1 w-40 sm:w-48 bg-[#1E293B] border border-[#334155] rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <button 
                      onClick={() => handleNavigation("/profile", "Loading profile settings...")}
                      className="block w-full text-left px-3 py-2 text-xs sm:text-sm text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 transition-all duration-300"
                    >
                      Profile Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-xs sm:text-sm text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 transition-all duration-300"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="transition-all duration-300 hover:opacity-90">
                  {/* Replaced nested button with div */}
                  <div onClick={() => handleNavigation("/register", "Creating account...")}>
                    <Button 
                      variant="outline" 
                      className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-gradient-to-r hover:from-[#8B5CF6]/20 hover:to-[#10B981]/20 text-white text-xs sm:text-sm transition-all duration-300"
                      size="sm"
                    >
                      Register
                    </Button>
                  </div>
                </div>
                <div className="transition-all duration-300 hover:opacity-90">
                  {/* Replaced nested button with div */}
                  <div onClick={() => handleNavigation("/login", "Signing in...")}>
                    <Button 
                      variant="outline" 
                      className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-gradient-to-r hover:from-[#8B5CF6]/20 hover:to-[#10B981]/20 text-white text-xs sm:text-sm transition-all duration-300"
                      size="sm"
                    >
                      Login
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#CBD5E1] hover:text-white focus:outline-none p-1 sm:p-2 transition-all duration-300"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div 
            className="md:hidden bg-[#1E293B] border-t border-[#334155]/50 overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: isMenuOpen ? '500px' : '0px' }}


>
            <div className="px-3 py-2 sm:px-4 sm:py-3 space-y-1">
              <button 
                onClick={() => handleNavigation("/find-bunks", "Finding charging stations...")}
                className="block w-full text-left px-3 py-2 rounded-md text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 transition-all duration-300"
              >
                Find Bunks
              </button>
              {/* Removed Payments nav item as it is not required */}
              <button 
                onClick={() => handleNavigation("/contact", "Loading contact page...")}
                className="block w-full text-left px-3 py-2 rounded-md text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 transition-all duration-300"
              >
                Contact
              </button>
              
              <div className="pt-2 pb-1 border-t border-[#334155]/50 mt-1">
                {session?.user ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-[#CBD5E1] text-sm">
                      Welcome, {userName || session.user.name || session.user.email}
                    </div>
                    {/* CHANGED: Direct link to dashboard instead of redirect page */}
                    <button 
                      onClick={() => {
                        if (session.user?.role === "admin") {
                          handleNavigation("/dashboard/admin", "Loading admin dashboard...");
                        } else {
                          handleNavigation("/dashboard", "Loading your dashboard...");
                        }
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white font-medium text-sm hover:opacity-90 transition-all duration-300"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={() => handleNavigation("/profile", "Loading profile settings...")}
                      className="block w-full text-left px-3 py-2 rounded-md text-[#CBD5E1] hover:text-white hover:bg-[#334155]/50 transition-all duration-300"
                    >
                      Profile Settings
                    </button>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md bg-gradient-to-r from-[#EF4444] to-[#F87171] text-white font-medium text-sm hover:opacity-90 transition-all duration-300"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button 
                      onClick={() => handleNavigation("/register", "Creating account...")}
                      className="block w-full text-center px-3 py-2 rounded-md bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white font-medium text-sm hover:opacity-90 transition-all duration-300"
                    >
                      Register
                    </button>
                    <button 
                      onClick={() => handleNavigation("/login", "Signing in...")}
                      className="block w-full text-center px-3 py-2 rounded-md bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white font-medium text-sm hover:opacity-90 transition-all duration-300"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};