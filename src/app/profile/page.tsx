"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useLoader } from '@/context/LoaderContext';
import Image from 'next/image';
import Toast from '@/components/common/Toast';

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

  // Password & Security State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);

  // Danger Zone State
  const [accountStatus, setAccountStatus] = useState<'active' | 'deactivated'>('active');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  // Load profile data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized.current) {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile(parsedProfile);
        } catch (e) {
          console.error('Failed to parse saved profile data', e);
        }
      }
      isInitialized.current = true;
    }
  }, []);

  // Save profile data to localStorage whenever it changes and notify other tabs
  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      // Dispatch storage event to notify other tabs/components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'userProfile',
          newValue: JSON.stringify(profile)
        }));
      }
    }
  }, [profile]);

  // Initialize profile data from session
  useEffect(() => {
    if (status === "authenticated" && session?.user && !isInitialized.current) {
      const savedProfile = localStorage.getItem('userProfile');
      let initialProfile;
      
      if (savedProfile) {
        try {
          initialProfile = JSON.parse(savedProfile);
        } catch (e) {
          console.error('Failed to parse saved profile data', e);
          initialProfile = null;
        }
      }
      
      // If we have saved data, use it. Otherwise, initialize with session data
      if (initialProfile) {
        setProfile(initialProfile);
      } else {
        setProfile({
          fullName: session.user.name || '',
          email: session.user.email || '',
          phone: initialProfile?.phone || '+1 (555) 123-4567', // Preserve phone if available
          location: initialProfile?.location || '', // Initialize location
          avatar: session.user.image || initialProfile?.avatar || '/assets/logo.png' // Preserve avatar if available
        });
      }
      
      isInitialized.current = true;
    }
  }, [status, session]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to your server
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle remove avatar
  const handleRemoveAvatar = () => {
    setProfile(prev => ({
      ...prev,
      avatar: '/assets/logo.png'
    }));
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    showLoader("Saving profile changes...");
    
    try {
      // Save to localStorage first
      localStorage.setItem('userProfile', JSON.stringify(profile));
      
      // If we have a session, update the user's data in the database
      if (session?.user?.id) {
        console.log('Profile: Updating data in database for user:', session.user.id);
        
        let hasError = false;
        
        // Update location if provided
        if (profile.location) {
          console.log('Profile: Updating location in database for user:', session.user.id, 'location:', profile.location);
          
          const response = await fetch(`/api/clients/${session.user.id}/location`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ location: profile.location }),
          });
          
          console.log('Profile: Location update response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Failed to update client location in database:", {
              status: response.status,
              statusText: response.statusText,
              error: errorData.error || 'Unknown error',
              details: errorData.details,
              clientId: session.user.id
            });
            // Show error to user with more specific message
            setToast({
              message: `Failed to update location: ${errorData.error || errorData.details || 'Unknown error'}`,
              type: 'error'
            });
            hasError = true;
          } else {
            const updatedClient = await response.json();
            console.log('Profile: Successfully updated client location in database:', updatedClient);
          }
        }
        
        // Update name if provided and different from current
        if (profile.fullName && profile.fullName !== session.user.name) {
          console.log('Profile: Updating name in database for user:', session.user.id, 'name:', profile.fullName);
          
          const response = await fetch(`/api/clients/${session.user.id}/name`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: profile.fullName }),
          });
          
          console.log('Profile: Name update response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Failed to update client name in database:", {
              status: response.status,
              statusText: response.statusText,
              error: errorData.error || 'Unknown error',
              details: errorData.details,
              clientId: session.user.id
            });
            // Show error to user with more specific message
            setToast({
              message: `Failed to update name: ${errorData.error || errorData.details || 'Unknown error'}`,
              type: 'error'
            });
            hasError = true;
          } else {
            const updatedClient = await response.json();
            console.log('Profile: Successfully updated client name in database:', updatedClient);
          }
        }
        
        if (hasError) {
          hideLoader();
          return; // Exit early if any update failed
        }
        
        // Successfully updated data, dispatch custom events to notify other components
        if (typeof window !== 'undefined') {
          // Dispatch storage event for backward compatibility
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'userProfile',
            newValue: JSON.stringify(profile)
          }));
          
          // Dispatch custom event for more reliable communication
          if (profile.location) {
            window.dispatchEvent(new CustomEvent('locationUpdated', {
              detail: { 
                userId: session.user.id, 
                location: profile.location 
              } 
            }));
          }
          
          // Dispatch custom event for name update
          if (profile.fullName && profile.fullName !== session.user.name) {
            window.dispatchEvent(new CustomEvent('profileUpdated', {
              detail: { fullName: profile.fullName }
            }));
          }
          
          console.log('Profile: Dispatched update events');
        }
      }
      
      // Simulate API call for other profile changes
      await new Promise(resolve => setTimeout(resolve, 1500));
      hideLoader();
      setToast({
        message: "Profile updated successfully!",
        type: 'success'
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      setToast({
        message: "Failed to save profile. Please try again.",
        type: 'error'
      });
      hideLoader();
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      // Handle password mismatch
      return;
    }
    
    showLoader("Updating password...");
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    hideLoader();
    setShowPasswordSuccess(true);
    setTimeout(() => setShowPasswordSuccess(false), 3000);
    
    // Reset form
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Handle deactivate account
  const handleDeactivateAccount = () => {
    // In a real app, you would call your API to deactivate the account
    setAccountStatus('deactivated');
    setShowDeactivateModal(false);
    // Show activation option immediately
    setShowActivateModal(true);
  };

  // Handle activate account
  const handleActivateAccount = () => {
    // In a real app, you would call your API to activate the account
    setAccountStatus('active');
    setShowActivateModal(false);
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    if (deleteStep < 3) {
      setDeleteStep(prev => prev + 1);
    } else {
      if (deleteConfirmation === 'DELETE MY ACCOUNT') {
        // In a real app, you would call your API to delete the account
        // Then redirect to login
        router.push('/login');
      }
    }
  };

  if (status === "loading") {
    return null; // Loader will be shown by the LoaderContext
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-[#F1F5F9] mb-1">
              Profile Settings
            </h1>
            <p className="text-[#CBD5E1] text-sm">
              Manage your account settings
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Profile Information Card */}
            <Card className="p-5">
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Profile Information</h2>
              
              <div className="flex flex-col items-center mb-4">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#10B981]">
                    <Image 
                      src={profile.avatar} 
                      alt="Profile" 
                      width={80} 
                      height={80}
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex space-x-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#10B981] rounded-full p-1.5 shadow-lg hover:bg-[#059669] transition-colors"
                      title="Change avatar"
                    >
                      <svg className="w-3.5 h-3.5 text-[#1E293B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </button>
                    {profile.avatar !== '/assets/logo.png' && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="bg-[#EF4444] rounded-full p-1.5 shadow-lg hover:bg-[#DC2626] transition-colors"
                        title="Remove avatar"
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <p className="text-xs text-[#94A3B8]">Click to change</p>
              </div>
              
              <div className="space-y-3">
                <Input
                  label="Full Name"
                  value={profile.fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                  className="py-2 px-3 text-sm"
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="py-2 px-3 text-sm"
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  value={profile.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="py-2 px-3 text-sm"
                />
                
                {/* Location Dropdown - Consistent with other Input components */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <select
                      value={profile.location}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const newLocation = e.target.value;
                        setProfile(prev => ({ ...prev, location: newLocation }));
                        // Dispatch location update immediately when location changes
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('locationUpdated', { 
                            detail: { 
                              location: newLocation 
                            } 
                          }));
                          // Also dispatch storage event for backward compatibility
                          window.dispatchEvent(new StorageEvent('storage', {
                            key: 'userProfile',
                            newValue: JSON.stringify({ ...profile, location: newLocation })
                          }));
                        }
                      }}
                      className="w-full bg-[#334155] border border-[#475569] rounded-lg py-2 px-3 text-[#F1F5F9] text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] appearance-none"
                    >
                      <option value="">Select your city</option>
                      {METROPOLITAN_CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSaveProfile}
                  className="w-full mt-2 py-2 text-sm"
                  glow={true}
                >
                  Save Changes
                </Button>
              </div>
            </Card>
            
            {/* Password & Security Card */}
            <Card className="p-5">
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Password & Security</h2>
              
              <div className="space-y-3">
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
                  <AnimatePresence>
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
                  </AnimatePresence>
                </div>
                
                <Button 
                  onClick={handleChangePassword}
                  className="w-full mt-1 py-2 text-sm"
                >
                  Update Password
                </Button>
                
                {/* Danger Zone moved inside Password & Security section */}
                <div className="pt-4 mt-4 border-t border-[#334155]">
                  <h3 className="text-lg font-bold text-[#F1F5F9] mb-3">Danger Zone</h3>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-[#334155]/50 rounded-lg">
                      <h4 className="font-medium text-[#F1F5F9] text-sm mb-1">Account Status</h4>
                      <p className="text-[#94A3B8] text-xs mb-2">
                        {accountStatus === 'active' 
                          ? 'Your account is currently active' 
                          : 'Your account is currently deactivated'}
                      </p>
                      {accountStatus === 'active' ? (
                        <Button 
                          variant="outline" 
                          onClick={() => setShowDeactivateModal(true)}
                          className="border-[#F59E0B] text-[#F1F5F9] hover:bg-[#F59E0B]/20 py-1.5 text-xs"
                          size="sm"
                        >
                          Deactivate Account
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={handleActivateAccount}
                          className="border-[#10B981] text-[#F1F5F9] hover:bg-[#10B981]/20 py-1.5 text-xs"
                          size="sm"
                        >
                          Activate Account
                        </Button>
                      )}
                    </div>
                    
                    <div className="p-3 bg-[#334155]/50 rounded-lg">
                      <h4 className="font-medium text-[#F1F5F9] text-sm mb-1">Delete Account</h4>
                      <p className="text-[#94A3B8] text-xs mb-2">
                        Permanently delete your account and all associated data
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setDeleteStep(1);
                          setShowDeleteModal(true);
                        }}
                        className="border-[#EF4444] text-[#F1F5F9] hover:bg-[#EF4444]/20 py-1.5 text-xs"
                        size="sm"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Deactivate Account Modal */}
      <AnimatePresence>
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
              className="bg-[#1E293B] border border-[#475569] rounded-xl p-5 w-full max-w-sm"
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
                Your account will be temporarily deactivated. You can reactivate it at any time by logging in.
              </p>
              <ul className="text-[#94A3B8] text-xs mb-5 space-y-2">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-[#F59E0B] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span>You won't be able to access your account until reactivated</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-[#F59E0B] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span>Your data will be preserved during deactivation</span>
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
      </AnimatePresence>
      
      {/* Activate Account Modal */}
      <AnimatePresence>
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
      </AnimatePresence>
      
      {/* Delete Account Modal */}
      <AnimatePresence>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#F1F5F9]">Delete Account</h3>
                  </div>
                  <p className="text-[#CBD5E1] text-sm mb-4">
                    This action is permanent and cannot be undone. All your data will be permanently deleted.
                  </p>
                  <ul className="text-[#94A3B8] text-xs mb-5 space-y-2">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-[#EF4444] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>All your profile information will be permanently deleted</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-[#EF4444] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>Your charging history and preferences will be lost forever</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-[#EF4444] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>You will lose access to all saved payment methods</span>
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
                    <div className="mr-3 p-2 bg-[#F59E0B]/20 rounded-lg">
                      <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#F1F5F9]">Final Confirmation</h3>
                  </div>
                  <p className="text-[#CBD5E1] text-sm mb-3">
                    To confirm, please type "DELETE MY ACCOUNT" in the box below:
                  </p>
                  <Input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className="py-2 px-3 text-sm mb-4"
                  />
                  <p className="text-[#CBD5E1] text-sm mb-3">
                    Please share your reason for leaving (optional):
                  </p>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Help us improve by sharing your reason..."
                    className="w-full bg-[#334155] border border-[#475569] rounded-lg py-2 px-3 text-[#F1F5F9] text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    rows={3}
                  />
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 py-2 text-sm"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== 'DELETE MY ACCOUNT'}
                      className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] py-2 text-sm disabled:opacity-50"
                      size="sm"
                    >
                      Permanently Delete
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
      </AnimatePresence>
      
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