"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/lib/LoaderContext'; // Import the universal loader context

// Mock data types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface Station {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'maintenance';
  slots: number;
  available: number;
}

interface SessionData {
  id: string;
  userId: string;
  stationId: string;
  startTime: string;
  endTime: string;
  energyConsumed: number;
  status: 'active' | 'completed' | 'cancelled';
}

interface Stat {
  id: string;
  name: string;
  value: number;
  change: number;
  color: string;
  icon: string;
}

// Helper function to render icons based on icon name
const renderIcon = (iconName: string) => {
  switch (iconName) {
    case 'user-group':
      return (
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      );
    case 'lightning-bolt':
      return (
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      );
    case 'clock':
      return (
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    case 'currency-rupee':
      return (
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      );
  }
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hideLoader, showLoader } = useLoader(); // Use the loader context to hide/show universal loader
  const [dataLoaded, setDataLoaded] = useState(false);

  // Handle loader when dashboard mounts
  useEffect(() => {
    // Show loader while fetching data
    if (status === "authenticated" && !dataLoaded) {
      showLoader("Loading dashboard data...");
    }
    
    // Cleanup function to ensure loader is hidden when component unmounts
    return () => {
      hideLoader();
    };
  }, [status, dataLoaded, showLoader, hideLoader]);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardSubTab, setDashboardSubTab] = useState('overview');
  const [usersSubTab, setUsersSubTab] = useState('all');
  const [stationsSubTab, setStationsSubTab] = useState('all');
  const [sessionsSubTab, setSessionsSubTab] = useState('active');
  const [reportsSubTab, setReportsSubTab] = useState('usage');
  const [settingsSubTab, setSettingsSubTab] = useState('general');

  // Real data from MongoDB
  const [stats, setStats] = useState<Stat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  // Removed local loading state - will rely on universal loader
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated' || session?.user?.role !== 'admin' || dataLoaded) {
        return;
      }

      try {
        setError(null);
        
        // Show loader during data fetching
        showLoader("Loading dashboard data...");
        
        // Fetch dashboard stats
        const statsRes = await fetch('/api/dashboard/stats');
        let statsData = [];
        if (statsRes.ok) {
          statsData = await statsRes.json();
        } else {
          const errorData = await statsRes.json();
          throw new Error(errorData.error || 'Failed to fetch dashboard stats');
        }
        
        // Fetch users
        const usersRes = await fetch('/api/dashboard/users');
        let usersData = [];
        if (usersRes.ok) {
          usersData = await usersRes.json();
        } else {
          const errorData = await usersRes.json();
          throw new Error(errorData.error || 'Failed to fetch users');
        }
        
        // Fetch stations
        const stationsRes = await fetch('/api/dashboard/stations');
        let stationsData = [];
        if (stationsRes.ok) {
          stationsData = await stationsRes.json();
        } else {
          const errorData = await stationsRes.json();
          throw new Error(errorData.error || 'Failed to fetch stations');
        }
        
        // Fetch sessions
        const sessionsRes = await fetch('/api/dashboard/sessions');
        let sessionsData = [];
        if (sessionsRes.ok) {
          sessionsData = await sessionsRes.json();
        } else {
          const errorData = await sessionsRes.json();
          throw new Error(errorData.error || 'Failed to fetch sessions');
        }
        
        setStats(statsData);
        setUsers(usersData);
        setStations(stationsData);
        setSessions(sessionsData);
        
        // Mark data as loaded
        setDataLoaded(true);
        
        // Hide loader after data is fetched
        hideLoader();
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to fetch dashboard data');
        // Hide loader even if there's an error
        hideLoader();
      }
    };

    fetchData();
  }, [status, session, dataLoaded, hideLoader, showLoader]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      hideLoader();
      router.push('/unauthorized');
    }
  }, [session, status, router, hideLoader]);

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout clicked');
  };

  if (status === 'loading') {
    // Return null since we're using the universal loader
    return null;
  }

  if (!session || session.user?.role !== 'admin') {
    // Return null since we're redirecting
    return null;
  }

  // Display error if there's an issue fetching data
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E293B] p-4">
        <div className="max-w-md w-full bg-[#1E293B]/50 border border-[#475569] rounded-xl p-6 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-[#94A3B8] mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#1E293B]">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/4">
            <div className="bg-[#1E293B]/50 border border-[#475569] rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-4">Dashboard</h3>
              <div className="flex flex-col gap-2">
                <button
                  className={`w-full px-4 py-2 rounded-lg ${
                    activeTab === 'dashboard' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                  }`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Overview
                </button>
                <button
                  className={`w-full px-4 py-2 rounded-lg ${
                    activeTab === 'users' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                  }`}
                  onClick={() => setActiveTab('users')}
                >
                  Users
                </button>
                <button
                  className={`w-full px-4 py-2 rounded-lg ${
                    activeTab === 'stations' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                  }`}
                  onClick={() => setActiveTab('stations')}
                >
                  Stations
                </button>
                <button
                  className={`w-full px-4 py-2 rounded-lg ${
                    activeTab === 'sessions' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                  }`}
                  onClick={() => setActiveTab('sessions')}
                >
                  Sessions
                </button>
                <button
                  className={`w-full px-4 py-2 rounded-lg ${
                    activeTab === 'reports' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                  }`}
                  onClick={() => setActiveTab('reports')}
                >
                  Reports
                </button>
                <button
                  className={`w-full px-4 py-2 rounded-lg ${
                    activeTab === 'settings' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </button>
                <button
                  className="w-full px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-3/4">
            {activeTab === 'dashboard' && (
              <div className="bg-[#1E293B]/50 border border-[#475569] rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">Dashboard Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat) => (
                    <Card key={stat.id} className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#94A3B8]">{stat.name}</p>
                          <p className="text-xl md:text-2xl font-bold text-white mt-1">{stat.value.toLocaleString()}</p>
                          <p className={`text-xs md:text-sm mt-1 ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% from last month
                          </p>
                        </div>
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-white`}>
                          {renderIcon(stat.icon)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'users' && (
              <div className="bg-[#1E293B]/50 border border-[#475569] rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">Users</h3>
                <div className="flex flex-col gap-2 mb-4">
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      usersSubTab === 'all' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setUsersSubTab('all')}
                  >
                    All Users
                  </button>
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      usersSubTab === 'active' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setUsersSubTab('active')}
                  >
                    Active Users
                  </button>
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      usersSubTab === 'inactive' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setUsersSubTab('inactive')}
                  >
                    Inactive Users
                  </button>
                </div>
                <div className="bg-[#1E293B]/50 border border-[#475569] rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-4">User List</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr>
                          <th className="px-4 py-2">ID</th>
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Email</th>
                          <th className="px-4 py-2">Role</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Last Login</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-4 py-2">{user.id}</td>
                            <td className="px-4 py-2">{user.name}</td>
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2">{user.role}</td>
                            <td className="px-4 py-2">{user.status}</td>
                            <td className="px-4 py-2">{user.lastLogin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'stations' && (
              <div className="bg-[#1E293B]/50 border border-[#475569] rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">Stations</h3>
                <div className="flex flex-col gap-2 mb-4">
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      stationsSubTab === 'all' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setStationsSubTab('all')}
                  >
                    All Stations
                  </button>
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      stationsSubTab === 'active' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setStationsSubTab('active')}
                  >
                    Active Stations
                  </button>
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      stationsSubTab === 'maintenance' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setStationsSubTab('maintenance')}
                  >
                    Maintenance Stations
                  </button>
                </div>
                <div className="bg-[#1E293B]/50 border border-[#475569] rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-4">Station List</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr>
                          <th className="px-4 py-2">ID</th>
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Location</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Slots</th>
                          <th className="px-4 py-2">Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stations.map((station) => (
                          <tr key={station.id}>
                            <td className="px-4 py-2">{station.id}</td>
                            <td className="px-4 py-2">{station.name}</td>
                            <td className="px-4 py-2">{station.location}</td>
                            <td className="px-4 py-2">{station.status}</td>
                            <td className="px-4 py-2">{station.slots}</td>
                            <td className="px-4 py-2">{station.available}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'sessions' && (
              <div className="bg-[#1E293B]/50 border border-[#475569] rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">Sessions</h3>
                <div className="flex flex-col gap-2 mb-4">
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      sessionsSubTab === 'active' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setSessionsSubTab('active')}
                  >
                    Active Sessions
                  </button>
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      sessionsSubTab === 'completed' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setSessionsSubTab('completed')}
                  >
                    Completed Sessions
                  </button>
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      sessionsSubTab === 'cancelled' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setSessionsSubTab('cancelled')}
                  >
                    Cancelled Sessions
                  </button>
                </div>
                <div className="bg-[#1E293B]/50 border border-[#475569] rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-4">Session List</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr>
                          <th className="px-4 py-2">ID</th>
                          <th className="px-4 py-2">User ID</th>
                          <th className="px-4 py-2">Station ID</th>
                          <th className="px-4 py-2">Start Time</th>
                          <th className="px-4 py-2">End Time</th>
                          <th className="px-4 py-2">Energy Consumed</th>
                          <th className="px-4 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session) => (
                          <tr key={session.id}>
                            <td className="px-4 py-2">{session.id}</td>
                            <td className="px-4 py-2">{session.userId}</td>
                            <td className="px-4 py-2">{session.stationId}</td>
                            <td className="px-4 py-2">{session.startTime}</td>
                            <td className="px-4 py-2">{session.endTime}</td>
                            <td className="px-4 py-2">{session.energyConsumed}</td>
                            <td className="px-4 py-2">{session.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'reports' && (
              <div className="bg-[#1E293B]/50 border border-[#475569] rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">Reports</h3>
                <div className="flex flex-col gap-2 mb-4">
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      reportsSubTab === 'usage' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setReportsSubTab('usage')}
                  >
                    Usage Reports
                  </button>
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      reportsSubTab === 'earnings' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setReportsSubTab('earnings')}
                  >
                    Earnings Reports
                  </button>
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      reportsSubTab === 'activity' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setReportsSubTab('activity')}
                  >
                    Activity Reports
                  </button>
                </div>
                <div className="bg-[#1E293B]/50 border border-[#475569] rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-4">Report Data</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr>
                          <th className="px-4 py-2">ID</th>
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Value</th>
                          <th className="px-4 py-2">Change</th>
                          <th className="px-4 py-2">Color</th>
                          <th className="px-4 py-2">Icon</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.map((stat) => (
                          <tr key={stat.id}>
                            <td className="px-4 py-2">{stat.id}</td>
                            <td className="px-4 py-2">{stat.name}</td>
                            <td className="px-4 py-2">{stat.value}</td>
                            <td className="px-4 py-2">{stat.change}</td>
                            <td className="px-4 py-2">{stat.color}</td>
                            <td className="px-4 py-2">{renderIcon(stat.icon)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="bg-[#1E293B]/50 border border-[#475569] rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">Settings</h3>
                <div className="flex flex-col gap-2 mb-4">
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      settingsSubTab === 'general' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setSettingsSubTab('general')}
                  >
                    General Settings
                  </button>
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      settingsSubTab === 'notifications' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setSettingsSubTab('notifications')}
                  >
                    Notification Settings
                  </button>
                  <button
                    className={`w-full px-4 py-2 rounded-lg ${
                      settingsSubTab === 'integrations' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white' : 'bg-[#334155] text-white hover:bg-[#475569] transition-colors'
                    }`}
                    onClick={() => setSettingsSubTab('integrations')}
                  >
                    Integration Settings
                  </button>
                </div>
                <div className="bg-[#1E293B]/50 border border-[#475569] rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-4">Settings Data</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr>
                          <th className="px-4 py-2">ID</th>
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Value</th>
                          <th className="px-4 py-2">Change</th>
                          <th className="px-4 py-2">Color</th>
                          <th className="px-4 py-2">Icon</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.map((stat) => (
                          <tr key={stat.id}>
                            <td className="px-4 py-2">{stat.id}</td>
                            <td className="px-4 py-2">{stat.name}</td>
                            <td className="px-4 py-2">{stat.value}</td>
                            <td className="px-4 py-2">{stat.change}</td>
                            <td className="px-4 py-2">{stat.color}</td>
                            <td className="px-4 py-2">{renderIcon(stat.icon)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1E293B] to-[#334155]">
      {/* Default Navbar */}
      <Navbar />
      
      {/* Main content area - Full width layout */}
      <div className="flex-1 flex flex-col w-full">
          {/* Tab Navigation - Displayed below header */}
          <div className="bg-[#1E293B] border-b border-[#334155]">
            <div className="flex overflow-x-auto md:overflow-visible px-4 py-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'dashboard' 
                    ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]' 
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span>Dashboard</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'users' 
                    ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]' 
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span>Users</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('stations')}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'stations' 
                    ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]' 
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  <span>Stations</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'sessions' 
                    ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]' 
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Sessions</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'reports' 
                    ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]' 
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span>Reports</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'settings' 
                    ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]' 
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>Settings</span>
                </div>
              </button>
            </div>
          </div>

          {/* Main content - Mobile-first responsive design */}
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            {/* Page content - Mobile-first responsive design */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
              <div className="max-w-full mx-auto w-full">
                {/* Dashboard view */}
                {activeTab === 'dashboard' && (
                  <div className="w-full">
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold text-white mb-2">Admin Powerhouse</h1>
                      <p className="text-[#94A3B8] text-xl">Your central control panel to manage, monitor, and master the system with ease.</p>
                      <p className="text-[#94A3B8] mt-2">Welcome, {session.user?.name || 'Admin'}. Here's what's happening today.</p>
                    </div>
                    
                    {/* Sub-tabs for Dashboard - Mobile-first responsive design */}
                    <div className="mb-6 border-b border-[#334155] overflow-x-auto">
                      <nav className="flex space-x-4 md:space-x-6 min-w-max md:min-w-0">
                        <button
                          onClick={() => setDashboardSubTab('overview')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            dashboardSubTab === 'overview'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Overview
                        </button>
                        <button
                          onClick={() => setDashboardSubTab('analytics')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            dashboardSubTab === 'analytics'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Analytics
                        </button>
                        <button
                          onClick={() => setDashboardSubTab('activity')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            dashboardSubTab === 'activity'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Recent Activity
                        </button>
                      </nav>
                    </div>

                    {/* Dashboard content based on sub-tab */}
                    {dashboardSubTab === 'overview' && (
                      <div className="w-full">
                        {/* Stats cards - Mobile-first responsive design */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                          {stats.map((stat) => (
                            <Card key={stat.id} className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-[#94A3B8]">{stat.name}</p>
                                  <p className="text-xl md:text-2xl font-bold text-white mt-1">{stat.value.toLocaleString()}</p>
                                  <p className={`text-xs md:text-sm mt-1 ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% from last month
                                  </p>
                                </div>
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-white`}>
                                  {renderIcon(stat.icon)}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                        
                        {/* Charts and reports - Mobile-first responsive design */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                          <div className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-[#94A3B8]">Revenue</p>
                                <p className="text-xl md:text-2xl font-bold text-white mt-1">$12,345</p>
                                <p className="text-xs md:text-sm mt-1 text-green-500">↑ 12% from last month</p>
                              </div>
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white">
                                <FaDollarSign />
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-[#94A3B8]">Orders</p>
                                <p className="text-xl md:text-2xl font-bold text-white mt-1">1,234</p>
                                <p className="text-xs md:text-sm mt-1 text-red-500">↓ 5% from last month</p>
                              </div>
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-r from-[#EC4899] to-[#DB2777] flex items-center justify-center text-white">
                                <FaShoppingCart />
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-[#94A3B8]">Customers</p>
                                <p className="text-xl md:text-2xl font-bold text-white mt-1">123</p>
                                <p className="text-xs md:text-sm mt-1 text-green-500">↑ 10% from last month</p>
                              </div>
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-r from-[#34D399] to-[#22C55E] flex items-center justify-center text-white">
                                <FaUsers />
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-[#94A3B8]">Products</p>
                                <p className="text-xl md:text-2xl font-bold text-white mt-1">45</p>
                                <p className="text-xs md:text-sm mt-1 text-green-500">↑ 20% from last month</p>
                              </div>
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] flex items-center justify-center text-white">
                                <FaBox />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {dashboardSubTab === 'activity' && (
                      <div className="w-full">
                        <div className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-[#94A3B8]">Recent Activity</p>
                              <p className="text-xl md:text-2xl font-bold text-white mt-1">123</p>
                              <p className="text-xs md:text-sm mt-1 text-green-500">↑ 10% from last month</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-r from-[#34D399] to-[#22C55E] flex items-center justify-center text-white">
                              <FaUsers />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                          <Card className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                              <h3 className="text-lg font-bold text-white">User Growth</h3>
                            </div>
                            <div className="h-48 md:h-64 flex items-center justify-center bg-[#334155]/30 rounded-lg border border-[#475569]">
                              <p className="text-[#94A3B8]">User Growth Chart</p>
                            </div>
                          </Card>
                          
                          <Card className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                              <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
                            </div>
                            <div className="h-48 md:h-64 flex items-center justify-center bg-[#334155]/30 rounded-lg border border-[#475569]">
                              <p className="text-[#94A3B8]">Revenue Chart</p>
                            </div>
                          </Card>
                        </div>
                      </div>
                    )}
                    
                    {dashboardSubTab === 'analytics' && (
                      <div className="w-full">
                        <Card className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6 mb-4 md:mb-6">
                          <h3 className="text-lg font-bold text-white mb-4 md:mb-6">System Analytics</h3>
                          <div className="h-64 md:h-96 flex items-center justify-center bg-[#334155]/30 rounded-lg border border-[#475569]">
                            <p className="text-[#94A3B8]">Advanced Analytics Dashboard</p>
                          </div>
                        </Card>
                      </div>
                    )}
                    
                    {dashboardSubTab === 'activity' && (
                      <div className="w-full">
                        {/* Recent activity - Mobile-first responsive design */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                          <Card className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                            <h3 className="text-lg font-bold text-white mb-4 md:mb-6">Recent Users</h3>
                            <div className="space-y-3 md:space-y-4">
                              {users.slice(0, 4).map((user) => (
                                <div key={user.id} className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-white text-xs md:text-sm font-medium mr-2 md:mr-3">
                                      {user.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-white font-medium text-sm md:text-base">{user.name}</p>
                                      <p className="text-[#94A3B8] text-xs md:text-sm">{user.email}</p>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    user.status === 'active' 
                                      ? 'bg-green-900/30 text-green-400' 
                                      : 'bg-red-900/30 text-red-400'
                                  }`}>
                                    {user.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </Card>
                          
                          <Card className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                            <h3 className="text-lg font-bold text-white mb-4 md:mb-6">Recent Sessions</h3>
                            <div className="space-y-3 md:space-y-4">
                              {sessions.slice(0, 4).map((sessionItem) => (
                                <div key={sessionItem.id} className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white font-medium text-sm md:text-base">Session #{sessionItem.id}</p>
                                    <p className="text-[#94A3B8] text-xs md:text-sm">
                                      {new Date(sessionItem.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                                      {sessionItem.status === 'active' ? 'Now' : new Date(sessionItem.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    sessionItem.status === 'active' 
                                      ? 'bg-blue-900/30 text-blue-400' 
                                      : sessionItem.status === 'completed'
                                        ? 'bg-green-900/30 text-green-400'
                                        : 'bg-red-900/30 text-red-400'
                                  }`}>
                                    {sessionItem.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Users view - Mobile-first responsive design */}
                {activeTab === 'users' && (
                  <div className="w-full">
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold text-white mb-2">Admin Powerhouse</h1>
                      <p className="text-[#94A3B8] text-xl">Your central control panel to manage, monitor, and master the system with ease.</p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">User Management</h2>
                        <p className="text-[#94A3B8] text-sm md:text-base">Manage client accounts and permissions</p>
                      </div>
                      <Button className="mt-3 md:mt-0 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white text-sm md:text-base">
                        <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add User
                      </Button>
                    </div>
                    
                    {/* Sub-tabs for Users - Mobile-first responsive design */}
                    <div className="mb-4 md:mb-6 border-b border-[#334155] overflow-x-auto">
                      <nav className="flex space-x-4 md:space-x-6 min-w-max md:min-w-0">
                        <button
                          onClick={() => setUsersSubTab('all')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            usersSubTab === 'all'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          All Users
                        </button>
                        <button
                          onClick={() => setUsersSubTab('active')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            usersSubTab === 'active'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Active
                        </button>
                        <button
                          onClick={() => setUsersSubTab('inactive')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            usersSubTab === 'inactive'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Inactive
                        </button>
                        <button
                          onClick={() => setUsersSubTab('admins')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            usersSubTab === 'admins'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Admins
                        </button>
                      </nav>
                    </div>

                    <Card className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                        <div className="relative mb-3 md:mb-0 md:mr-3 w-full md:w-auto">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 md:h-5 md:w-5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search users..."
                            className="block w-full pl-9 pr-3 py-2 rounded-lg bg-[#334155] border border-[#475569] text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent text-sm md:text-base"
                          />
                        </div>
                        <div className="flex space-x-2 w-full md:w-auto">
                          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                            </svg>
                            <span className="hidden md:inline ml-1">Filter</span>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            <span className="hidden md:inline ml-1">Export</span>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#475569]">
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm">User</th>
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm hidden md:table-cell">Email</th>
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm">Role</th>
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm">Status</th>
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm hidden lg:table-cell">Last Login</th>
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user) => (
                              <tr key={user.id} className="border-b border-[#475569] hover:bg-[#334155]/30">
                                <td className="py-3 md:py-4">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-white text-xs md:text-sm font-medium mr-2 md:mr-3">
                                      {user.name.charAt(0)}
                                    </div>
                                    <div>
                                      <span className="text-white text-sm md:text-base block">{user.name}</span>
                                      <span className="text-[#94A3B8] text-xs md:hidden">{user.email}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 md:py-4 text-[#94A3B8] text-xs md:text-sm hidden md:table-cell">{user.email}</td>
                                <td className="py-3 md:py-4">
                                  <span className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-400">
                                    {user.role}
                                  </span>
                                </td>
                                <td className="py-3 md:py-4">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    user.status === 'active' 
                                      ? 'bg-green-900/30 text-green-400' 
                                      : 'bg-red-900/30 text-red-400'
                                  }`}>
                                    {user.status}
                                  </span>
                                </td>
                                <td className="py-3 md:py-4 text-[#94A3B8] text-xs md:text-sm hidden lg:table-cell">{user.lastLogin}</td>
                                <td className="py-3 md:py-4">
                                  <div className="flex space-x-1">
                                    <Button variant="outline" size="sm" className="p-1 md:p-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                      </svg>
                                    </Button>
                                    <Button variant="outline" size="sm" className="p-1 md:p-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                      </svg>
                                    </Button>
                                    <Button variant="outline" size="sm" className="p-1 md:p-2 text-red-400 hover:text-red-300">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                      </svg>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 md:mt-6">
                        <p className="text-[#94A3B8] text-xs md:text-sm mb-3 md:mb-0">Showing 1 to {users.length} of {users.length} results</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" disabled className="text-xs md:text-sm">Previous</Button>
                          <Button variant="outline" size="sm" className="text-xs md:text-sm">Next</Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
                
                {/* Stations view - Mobile-first responsive design */}
                {activeTab === 'stations' && (
                  <div className="w-full">
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold text-white mb-2">Admin Powerhouse</h1>
                      <p className="text-[#94A3B8] text-xl">Your central control panel to manage, monitor, and master the system with ease.</p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Station Management</h2>
                        <p className="text-[#94A3B8] text-sm md:text-base">Add, edit, or remove charging stations</p>
                      </div>
                      <Button className="mt-3 md:mt-0 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white text-sm md:text-base">
                        <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add Station
                      </Button>
                    </div>
                    
                    {/* Sub-tabs for Stations - Mobile-first responsive design */}
                    <div className="mb-4 md:mb-6 border-b border-[#334155] overflow-x-auto">
                      <nav className="flex space-x-4 md:space-x-6 min-w-max md:min-w-0">
                        <button
                          onClick={() => setStationsSubTab('all')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            stationsSubTab === 'all'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          All Stations
                        </button>
                        <button
                          onClick={() => setStationsSubTab('active')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            stationsSubTab === 'active'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Active
                        </button>
                        <button
                          onClick={() => setStationsSubTab('maintenance')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            stationsSubTab === 'maintenance'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Maintenance
                        </button>
                      </nav>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                      {stations.map((station) => (
                        <Card key={station.id} className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                          <div className="flex items-center justify-between mb-3 md:mb-4">
                            <h3 className="text-base md:text-lg font-bold text-white truncate">{station.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              station.status === 'active' 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-yellow-900/30 text-yellow-400'
                            }`}>
                              {station.status}
                            </span>
                          </div>
                          <p className="text-[#94A3B8] text-sm md:text-base mb-3 md:mb-4">{station.location}</p>
                          <div className="flex items-center justify-between mb-3 md:mb-4">
                            <div>
                              <p className="text-xs md:text-sm text-[#94A3B8]">Slots</p>
                              <p className="text-white font-medium text-sm md:text-base">{station.slots}</p>
                            </div>
                            <div>
                              <p className="text-xs md:text-sm text-[#94A3B8]">Available</p>
                              <p className="text-white font-medium text-sm md:text-base">{station.available}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1 text-xs md:text-sm">
                              <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 text-red-400 hover:text-red-300 text-xs md:text-sm">
                              <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                              Remove
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Sessions view - Mobile-first responsive design */}
                {activeTab === 'sessions' && (
                  <div className="w-full">
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold text-white mb-2">Admin Powerhouse</h1>
                      <p className="text-[#94A3B8] text-xl">Your central control panel to manage, monitor, and master the system with ease.</p>
                    </div>
                    <div className="mb-4 md:mb-6">
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Session Management</h2>
                      <p className="text-[#94A3B8] text-sm md:text-base">Monitor and manage active charging sessions</p>
                    </div>
                    
                    {/* Sub-tabs for Sessions - Mobile-first responsive design */}
                    <div className="mb-4 md:mb-6 border-b border-[#334155] overflow-x-auto">
                      <nav className="flex space-x-4 md:space-x-6 min-w-max md:min-w-0">
                        <button
                          onClick={() => setSessionsSubTab('active')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            sessionsSubTab === 'active'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Active
                        </button>
                        <button
                          onClick={() => setSessionsSubTab('completed')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            sessionsSubTab === 'completed'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Completed
                        </button>
                        <button
                          onClick={() => setSessionsSubTab('cancelled')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            sessionsSubTab === 'cancelled'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Cancelled
                        </button>
                        <button
                          onClick={() => setSessionsSubTab('all')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            sessionsSubTab === 'all'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          All Sessions
                        </button>
                      </nav>
                    </div>

                    <Card className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                        <div className="relative mb-3 md:mb-0 md:mr-3 w-full md:w-auto">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 md:h-5 md:w-5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search sessions..."
                            className="block w-full pl-9 pr-3 py-2 rounded-lg bg-[#334155] border border-[#475569] text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent text-sm md:text-base"
                          />
                        </div>
                        <div className="flex space-x-2 w-full md:w-auto">
                          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                            </svg>
                            <span className="hidden md:inline ml-1">Filter</span>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            <span className="hidden md:inline ml-1">Export</span>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#475569]">
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm">Session ID</th>
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm hidden md:table-cell">User</th>
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm">Station</th>
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm">Duration</th>
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm">Energy</th>
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm">Status</th>
                              <th className="py-2 md:py-3 text-left text-[#94A3B8] font-medium text-xs md:text-sm">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions.map((sessionItem) => (
                              <tr key={sessionItem.id} className="border-b border-[#475569] hover:bg-[#334155]/30">
                                <td className="py-3 md:py-4 text-white text-xs md:text-sm">#{sessionItem.id}</td>
                                <td className="py-3 md:py-4 text-[#94A3B8] text-xs md:text-sm hidden md:table-cell">User {sessionItem.userId}</td>
                                <td className="py-3 md:py-4 text-[#94A3B8] text-xs md:text-sm">Station {sessionItem.stationId}</td>
                                <td className="py-3 md:py-4 text-[#94A3B8] text-xs md:text-sm">
                                  {new Date(sessionItem.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                                  {sessionItem.status === 'active' ? 'Now' : new Date(sessionItem.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-3 md:py-4 text-white text-xs md:text-sm">{sessionItem.energyConsumed} kWh</td>
                                <td className="py-3 md:py-4">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    sessionItem.status === 'active' 
                                      ? 'bg-blue-900/30 text-blue-400' 
                                      : sessionItem.status === 'completed'
                                        ? 'bg-green-900/30 text-green-400'
                                        : 'bg-red-900/30 text-red-400'
                                  }`}>
                                    {sessionItem.status}
                                  </span>
                                </td>
                                <td className="py-3 md:py-4">
                                  <div className="flex space-x-1">
                                    <Button variant="outline" size="sm" className="p-1 md:p-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                      </svg>
                                    </Button>
                                    {sessionItem.status === 'active' && (
                                      <Button variant="outline" size="sm" className="p-1 md:p-2 text-red-400 hover:text-red-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M24 0l-6 22-8.129-7.239 7.1-3 2 4.701 6-12.3-1.854.704z"></path>
                                        </svg>
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 md:mt-6">
                        <p className="text-[#94A3B8] text-xs md:text-sm mb-3 md:mb-0">Showing 1 to {sessions.length} of {sessions.length} results</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" disabled className="text-xs md:text-sm">Previous</Button>
                          <Button variant="outline" size="sm" className="text-xs md:text-sm">Next</Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
                
                {/* Reports view - Mobile-first responsive design */}
                {activeTab === 'reports' && (
                  <div className="w-full">
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold text-white mb-2">Admin Powerhouse</h1>
                      <p className="text-[#94A3B8] text-xl">Your central control panel to manage, monitor, and master the system with ease.</p>
                    </div>
                    <div className="mb-4 md:mb-6">
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Reports & Analytics</h2>
                      <p className="text-[#94A3B8] text-sm md:text-base">Detailed insights and performance metrics</p>
                    </div>
                    
                    {/* Sub-tabs for Reports - Mobile-first responsive design */}
                    <div className="mb-4 md:mb-6 border-b border-[#334155] overflow-x-auto">
                      <nav className="flex space-x-4 md:space-x-6 min-w-max md:min-w-0">
                        <button
                          onClick={() => setReportsSubTab('usage')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            reportsSubTab === 'usage'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Usage Reports
                        </button>
                        <button
                          onClick={() => setReportsSubTab('financial')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            reportsSubTab === 'financial'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Financial
                        </button>
                        <button
                          onClick={() => setReportsSubTab('performance')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            reportsSubTab === 'performance'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Performance
                        </button>
                      </nav>
                    </div>

                    <Card className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                      <h3 className="text-lg font-bold text-white mb-4 md:mb-6">Usage Statistics</h3>
                      <div className="h-64 md:h-96 flex items-center justify-center bg-[#334155]/30 rounded-lg border border-[#475569]">
                        <p className="text-[#94A3B8]">Usage Reports Dashboard</p>
                      </div>
                    </Card>
                  </div>
                )}
                
                {/* Settings view - Mobile-first responsive design */}
                {activeTab === 'settings' && (
                  <div className="w-full">
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold text-white mb-2">Admin Powerhouse</h1>
                      <p className="text-[#94A3B8] text-xl">Your central control panel to manage, monitor, and master the system with ease.</p>
                    </div>
                    <div className="mb-4 md:mb-6">
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">System Settings</h2>
                      <p className="text-[#94A3B8] text-sm md:text-base">Configure application preferences and policies</p>
                    </div>
                    
                    {/* Sub-tabs for Settings - Mobile-first responsive design */}
                    <div className="mb-4 md:mb-6 border-b border-[#334155] overflow-x-auto">
                      <nav className="flex space-x-4 md:space-x-6 min-w-max md:min-w-0">
                        <button
                          onClick={() => setSettingsSubTab('general')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            settingsSubTab === 'general'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          General
                        </button>
                        <button
                          onClick={() => setSettingsSubTab('security')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            settingsSubTab === 'security'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Security
                        </button>
                        <button
                          onClick={() => setSettingsSubTab('notifications')}
                          className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                            settingsSubTab === 'notifications'
                              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Notifications
                        </button>
                      </nav>
                    </div>

                    <Card className="bg-[#1E293B]/50 border border-[#475569] rounded-xl p-4 md:p-6">
                      <h3 className="text-lg font-bold text-white mb-4 md:mb-6">General Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#94A3B8] mb-1">Application Name</label>
                          <input
                            type="text"
                            defaultValue="EV Bunker Admin"
                            className="block w-full px-3 py-2 rounded-lg bg-[#334155] border border-[#475569] text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#94A3B8] mb-1">Timezone</label>
                          <select className="block w-full px-3 py-2 rounded-lg bg-[#334155] border border-[#475569] text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent">
                            <option>UTC</option>
                            <option>GMT</option>
                            <option>EST</option>
                            <option>PST</option>
                          </select>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="maintenance-mode"
                            className="h-4 w-4 text-[#8B5CF6] rounded focus:ring-[#8B5CF6] border-[#475569] bg-[#334155]"
                          />
                          <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-[#94A3B8]">
                            Maintenance Mode
                          </label>
                        </div>
                        <Button className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white">
                          Save Changes
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}