"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useLoader } from '@/context/LoaderContext';
import Image from 'next/image';
import Toast from '@/components/common/Toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// List of major metropolitan cities in India
const METROPOLITAN_CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad"
];

export default function ProfileSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);

  // Profile Information State
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    avatar: '/assets/logo.png'
  });

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);

  // Account Status State
  const [accountStatus, setAccountStatus] = useState<'active' | 'inactive'>('active');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);

  // Handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to your server
      // For now, we'll just create a local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
      
      // Show success toast
      setToast({
        message: "Profile image updated successfully!",
        type: "success"
      });
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoader("Updating profile...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    hideLoader();
    
    // Show success toast
    setToast({
      message: "Profile updated successfully!",
      type: "success"
    });
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({
        message: "New passwords do not match!",
        type: "error"
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setToast({
        message: "Password must be at least 6 characters long!",
        type: "error"
      });
      return;
    }
    
    showLoader("Changing password...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    hideLoader();
    
    // Reset form and show success
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordSuccess(true);
    
    // Hide success indicator after 3 seconds
    setTimeout(() => {
      setShowPasswordSuccess(false);
    }, 3000);
    
    setToast({
      message: "Password changed successfully!",
      type: "success"
    });
  };

  // Handle account deactivation
  const handleDeactivateAccount = async () => {
    showLoader("Deactivating account...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAccountStatus('inactive');
    setShowDeactivateModal(false);
    hideLoader();
    
    setToast({
      message: "Account deactivated successfully!",
      type: "success"
    });
  };

  // Handle account activation
  const handleActivateAccount = async () => {
    showLoader("Activating account...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAccountStatus('active');
    setShowActivateModal(false);
    hideLoader();
    
    setToast({
      message: "Account activated successfully!",
      type: "success"
    });
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    showLoader("Deleting account...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setShowDeleteModal(false);
    hideLoader();
    
    // In a real app, you would sign out the user and redirect to home
    setToast({
      message: "Account deleted successfully!",
      type: "success"
    });
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  // Initialize profile data when session is available
  useEffect(() => {
    if (status === "authenticated" && session?.user && !isInitialized.current) {
      isInitialized.current = true;
      
      setProfile({
        fullName: session.user.name || '',
        email: session.user.email || '',
        phone: '',
        location: '',
        avatar: session.user.image || '/assets/logo.png'
      });
    }
  }, [status, session]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-[#CBD5E1]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will be redirected
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] opacity-10 blur-3xl"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-[#8B5CF6]" style={{ left: `${i * 5}%` }}></div>
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute left-0 right-0 h-px bg-[#10B981]" style={{ top: `${i * 5}%` }}></div>
          ))}
        </div>
      </div>
      
      <Navbar />
      
      <main className="pt-20 pb-8 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-[#F1F5F9]">Profile Settings</h1>
            <p className="text-[#94A3B8]">Manage your account information and preferences</p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Picture and Account Status */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-[#1E293B]/80 border border-[#334155] p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#8B5CF6] mx-auto">
                      <Image 
                        src={profile.avatar} 
                        alt="Profile" 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-[#8B5CF6] rounded-full p-2 shadow-lg hover:bg-[#7C3AED] transition-colors"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-[#F1F5F9] mt-4">{profile.fullName || 'User'}</h2>
                  <p className="text-[#94A3B8] text-sm">{profile.email}</p>
                  
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-3 ${
                    accountStatus === 'active' 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      accountStatus === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                    }`}></span>
                    {accountStatus === 'active' ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </Card>
              
              <Card className="bg-[#1E293B]/80 border border-[#334155] p-6">
                <h3 className="font-bold text-[#F1F5F9] mb-4">Account Actions</h3>
                <div className="space-y-3">
                  {accountStatus === 'active' ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeactivateModal(true)}
                      className="w-full border-[#F59E0B] text-[#F1F5F9] hover:bg-[#F59E0B]/20 py-2 text-sm"
                      size="sm"
                    >
                      Deactivate Account
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowActivateModal(true)}
                      className="w-full border-[#10B981] text-[#F1F5F9] hover:bg-[#10B981]/20 py-2 text-sm"
                      size="sm"
                    >
                      Activate Account
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setDeleteStep(1);
                      setShowDeleteModal(true);
                    }}
                    className="w-full border-[#EF4444] text-[#F1F5F9] hover:bg-[#EF4444]/20 py-2 text-sm"
                    size="sm"
                  >
                    Delete Account
                  </Button>
                </div>
              </Card>
            </div>
            
            {/* Right Column - Profile and Security Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <Card className="bg-[#1E293B]/80 border border-[#334155] p-6">
                <h3 className="font-bold text-[#F1F5F9] mb-4">Profile Information</h3>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      className="py-2 px-3 text-sm"
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="py-2 px-3 text-sm"
                      disabled
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="py-2 px-3 text-sm"
                    />
                    <div>
                      <label className="block text-sm font-medium text-[#CBD5E1] mb-2">
                        Location
                      </label>
                      <select
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-sm"
                      >
                        <option value="">Select your city</option>
                        {METROPOLITAN_CITIES.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full mt-2 py-2 text-sm">
                    Update Profile
                  </Button>
                </form>
              </Card>
              
              {/* Security Settings */}
              <Card className="bg-[#1E293B]/80 border border-[#334155] p-6">
                <h3 className="font-bold text-[#F1F5F9] mb-4">Security Settings</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="py-2 px-3 text-sm"
                  />
                  
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="py-2 px-3 text-sm"
                  />
                  
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="py-2 px-3 text-sm"
                  />
                  
                  <div className="relative">
                    {showPasswordSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -top-7 right-0 text-[#10B981] text-xs flex items-center"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Updated!
                      </motion.div>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full mt-1 py-2 text-sm">
                    Change Password
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1E293B] border border-[#475569] rounded-xl p-5 w-full max-w-md"
          >
            <div className="flex items-center mb-3">
              <div className="mr-3 p-2 bg-[#F59E0B]/20 rounded-lg">
                <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#F1F5F9]">Deactivate Account</h3>
            </div>
            <p className="text-[#CBD5E1] text-sm mb-4">
              Are you sure you want to deactivate your account? You can reactivate it at any time by logging in.
            </p>
            <ul className="text-[#94A3B8] text-xs mb-5 space-y-2">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-[#F59E0B] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>Your data will be preserved during deactivation</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-[#F59E0B] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>You won't be able to access your account until reactivation</span>
              </li>
            </ul>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 py-2 text-sm"
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeactivateAccount}
                className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] py-2 text-sm"
                size="sm"
              >
                Deactivate
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Activate Account Modal */}
      {showActivateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1E293B] border border-[#475569] rounded-xl p-5 w-full max-w-sm"
          >
            <div className="flex items-center mb-3">
              <div className="mr-3 p-2 bg-[#10B981]/20 rounded-lg">
                <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#F1F5F9]">Account Activated</h3>
            </div>
            <p className="text-[#CBD5E1] text-sm mb-5">
              Your account has been successfully reactivated. You now have full access to all features.
            </p>
            <Button 
              onClick={() => setShowActivateModal(false)}
              className="w-full py-2 text-sm"
              size="sm"
            >
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
      
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1E293B] border border-[#475569] rounded-xl p-5 w-full max-w-md"
          >
            {deleteStep === 1 && (
              <>
                <div className="flex items-center mb-3">
                  <div className="mr-3 p-2 bg-[#EF4444]/20 rounded-lg">
                    <svg className="w-6 h-6 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#F1F5F9]">Delete Account</h3>
                </div>
                <p className="text-[#CBD5E1] text-sm mb-4">
                  Are you sure you want to permanently delete your account? This action cannot be undone.
                </p>
                <ul className="text-[#94A3B8] text-xs mb-5 space-y-2">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-[#EF4444] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    <span>All your data will be permanently deleted</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-[#EF4444] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    <span>You will lose access to all services</span>
                  </li>
                </ul>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2 text-sm"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => setDeleteStep(2)}
                    className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] py-2 text-sm"
                    size="sm"
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}
            
            {deleteStep === 2 && (
              <>
                <div className="flex items-center mb-3">
                  <div className="mr-3 p-2 bg-[#EF4444]/20 rounded-lg">
                    <svg className="w-6 h-6 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#F1F5F9]">Confirm Deletion</h3>
                </div>
                <p className="text-[#CBD5E1] text-sm mb-4">
                  To confirm, please type "DELETE" in the box below:
                </p>
                <input
                  type="text"
                  placeholder="Type DELETE"
                  className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:border-transparent text-sm mb-4"
                  onChange={(e) => {
                    if (e.target.value === "DELETE") {
                      setDeleteStep(3);
                    }
                  }}
                />
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2 text-sm"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
            
            {deleteStep === 3 && (
              <>
                <div className="flex items-center mb-3">
                  <div className="mr-3 p-2 bg-[#10B981]/20 rounded-lg">
                    <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#F1F5F9]">Account Deleted</h3>
                </div>
                <p className="text-[#CBD5E1] text-sm mb-5">
                  Your account has been successfully deleted. Thank you for using our service.
                </p>
                <Button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    router.push('/login');
                  }}
                  className="w-full py-2 text-sm"
                  size="sm"
                >
                  Continue to Login
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}