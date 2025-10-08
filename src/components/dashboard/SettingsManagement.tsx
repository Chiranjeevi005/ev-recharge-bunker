"use client";

import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

interface SettingsManagementProps {
  settingsSubTab: string;
  setSettingsSubTab: (subTab: string) => void;
  updateUrl: (tab: string, subTab: string) => void;
}

export function SettingsManagement({ settingsSubTab, setSettingsSubTab, updateUrl }: SettingsManagementProps) {
  const [siteName, setSiteName] = useState('EV Bunker');
  const [contactEmail, setContactEmail] = useState('admin@evbunker.com');
  const [timezone, setTimezone] = useState('IST (UTC+5:30)');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    specialChars: false
  });
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [notifications, setNotifications] = useState({
    paymentConfirmations: true,
    systemAlerts: true,
    maintenanceNotifications: false
  });

  const handleSaveGeneralSettings = () => {
    // Save general settings logic here
    console.log('Saving general settings:', { siteName, contactEmail, timezone, maintenanceMode });
  };

  const handleUpdateSecuritySettings = () => {
    // Update security settings logic here
    console.log('Updating security settings:', { passwordPolicy, twoFactorAuth });
  };

  const handleSaveNotificationSettings = () => {
    // Save notification settings logic here
    console.log('Saving notification settings:', notifications);
  };

  return (
    <div className="w-full">
      {/* Sub-tabs for Settings - Mobile-first responsive design */}
      <div className="mb-6 border-b border-[#334155] overflow-x-auto">
        <nav className="flex space-x-4 md:space-x-6 min-w-max md:min-w-0">
          <button
            onClick={() => {
              setSettingsSubTab('general');
              updateUrl('settings', 'general');
            }}
            className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
              settingsSubTab === 'general'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            General
          </button>
          <button
            onClick={() => {
              setSettingsSubTab('security');
              updateUrl('settings', 'security');
            }}
            className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
              settingsSubTab === 'security'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => {
              setSettingsSubTab('notifications');
              updateUrl('settings', 'notifications');
            }}
            className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
              settingsSubTab === 'notifications'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Notifications
          </button>
        </nav>
      </div>

      {/* Settings content based on sub-tab */}
      {settingsSubTab === 'general' && (
        <div className="w-full">
          <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-[#F1F5F9] mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#CBD5E1] mb-1">Site Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#334155] border border-[#475569] text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#CBD5E1] mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#334155] border border-[#475569] text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#CBD5E1] mb-1">Timezone</label>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#334155] border border-[#475569] text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                >
                  <option>UTC</option>
                  <option>IST (UTC+5:30)</option>
                  <option>PST (UTC-8:00)</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="font-medium text-[#F1F5F9]">Maintenance Mode</h4>
                  <p className="text-sm text-[#CBD5E1]">Temporarily disable the platform for maintenance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-[#475569] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                </label>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={handleSaveGeneralSettings}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {settingsSubTab === 'security' && (
        <div className="w-full">
          <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-[#F1F5F9] mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-[#F1F5F9] mb-2">Password Policy</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={passwordPolicy.uppercase}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, uppercase: e.target.checked})}
                      className="mr-2 rounded bg-[#334155] border-[#475569] text-[#8B5CF6] focus:ring-[#8B5CF6]" 
                    />
                    <label className="text-sm text-[#CBD5E1]">Require uppercase letters</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={passwordPolicy.lowercase}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, lowercase: e.target.checked})}
                      className="mr-2 rounded bg-[#334155] border-[#475569] text-[#8B5CF6] focus:ring-[#8B5CF6]" 
                    />
                    <label className="text-sm text-[#CBD5E1]">Require lowercase letters</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={passwordPolicy.numbers}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, numbers: e.target.checked})}
                      className="mr-2 rounded bg-[#334155] border-[#475569] text-[#8B5CF6] focus:ring-[#8B5CF6]" 
                    />
                    <label className="text-sm text-[#CBD5E1]">Require numbers</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={passwordPolicy.specialChars}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, specialChars: e.target.checked})}
                      className="mr-2 rounded bg-[#334155] border-[#475569] text-[#8B5CF6] focus:ring-[#8B5CF6]" 
                    />
                    <label className="text-sm text-[#CBD5E1]">Require special characters</label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-[#F1F5F9] mb-2">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#CBD5E1]">Require 2FA for all admin accounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={twoFactorAuth}
                      onChange={(e) => setTwoFactorAuth(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#475569] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                  </label>
                </div>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={handleUpdateSecuritySettings}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
                >
                  Update Security Settings
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {settingsSubTab === 'notifications' && (
        <div className="w-full">
          <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-[#F1F5F9] mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-[#F1F5F9] mb-2">Email Notifications</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-[#CBD5E1]">Payment confirmations</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications.paymentConfirmations}
                        onChange={(e) => setNotifications({...notifications, paymentConfirmations: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[#475569] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-[#CBD5E1]">System alerts</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications.systemAlerts}
                        onChange={(e) => setNotifications({...notifications, systemAlerts: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[#475569] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-[#CBD5E1]">Maintenance notifications</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications.maintenanceNotifications}
                        onChange={(e) => setNotifications({...notifications, maintenanceNotifications: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[#475569] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={handleSaveNotificationSettings}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
                >
                  Save Notification Settings
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}