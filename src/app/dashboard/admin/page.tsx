"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoader } from '@/context/LoaderContext';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AdminDashboardTabs, DashboardOverview, DashboardAnalytics, DashboardActivity, ClientsManagement, StationsManagement, PaymentsManagement, ReportsManagement, SettingsManagement } from '@/components/dashboard';

// Loading component for Suspense
function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center p-4">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-[#CBD5E1]">Loading dashboard...</p>
      </div>
    </div>
  );
}

interface Client {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  totalChargingSessions?: number;
  totalAmountSpent?: number;
  co2Saved?: number;
}

interface Station {
  _id: string;
  name: string;
  address: string;
  city: string;
  status: 'active' | 'maintenance' | 'inactive';
  totalSlots: number;
  availableSlots: number;
  createdAt: string;
}

interface Payment {
  _id: string;
  userId: string;
  stationId: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  currency: string;
  method?: string;
  createdAt: string;
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
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      );
    case 'lightning-bolt':
      return (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      );
    case 'clock':
      return (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    case 'currency-rupee':
      return (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    case 'tree':
      return (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      );
  }
};

function AdminDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hideLoader, showLoader } = useLoader();
  const { isConnected, updates, joinUserRoom, data: realTimeData, loading, error } = useRealTimeData();
  const dataFetchedRef = useRef(false);
  
  // Redirect if user is not an admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role && session.user.role !== 'admin') {
      // Redirect to appropriate dashboard based on role
      if (session.user.role === 'client') {
        router.push('/dashboard/client');
      } else {
        router.push('/unauthorized');
      }
    }
  }, [session, status, router]);
  
  // Check if we're running on Vercel (serverless environment)
  const isVercel = process.env['NEXT_PUBLIC_VERCEL_ENV'] === 'production' || 
                  process.env['VERCEL'] === '1' ||
                  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'));
  
  // Initialize route transition handler
  // We'll move this to a separate component that's wrapped in Suspense
  // useRouteTransition();

  // Get initial tab state from URL parameters
  const initialTab = searchParams?.get('tab') || 'dashboard';
  const initialSubTab = searchParams?.get('subTab') || 
    (initialTab === 'dashboard' ? 'overview' : 
     initialTab === 'clients' ? 'all' : 
     initialTab === 'stations' ? 'all' : 
     initialTab === 'payments' ? 'all' : 
     initialTab === 'reports' ? 'usage' : 
     initialTab === 'settings' ? 'general' : 'overview');

  const [activeTab, setActiveTab] = useState(initialTab);
  const [dashboardSubTab, setDashboardSubTab] = useState(initialTab === 'dashboard' ? initialSubTab : 'overview');
  const [clientsSubTab, setClientsSubTab] = useState(initialTab === 'clients' ? initialSubTab : 'all');
  const [stationsSubTab, setStationsSubTab] = useState(initialTab === 'stations' ? initialSubTab : 'all');
  const [paymentsSubTab, setPaymentsSubTab] = useState(initialTab === 'payments' ? initialSubTab : 'all');
  const [reportsSubTab, setReportsSubTab] = useState(initialTab === 'reports' ? initialSubTab : 'usage');
  const [settingsSubTab, setSettingsSubTab] = useState(initialTab === 'settings' ? initialSubTab : 'general');

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams?.get('tab') || null;
    const subTab = searchParams?.get('subTab') || null;
    
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
    
    if (subTab) {
      switch (tab || activeTab) {
        case 'dashboard':
          if (subTab !== dashboardSubTab) setDashboardSubTab(subTab);
          break;
        case 'clients':
          if (subTab !== clientsSubTab) setClientsSubTab(subTab);
          break;
        case 'stations':
          if (subTab !== stationsSubTab) setStationsSubTab(subTab);
          break;
        case 'payments':
          if (subTab !== paymentsSubTab) setPaymentsSubTab(subTab);
          break;
        case 'reports':
          if (subTab !== reportsSubTab) setReportsSubTab(subTab);
          break;
        case 'settings':
          if (subTab !== settingsSubTab) setSettingsSubTab(subTab);
          break;
        default:
          break;
      }
    }
  }, [searchParams, activeTab, dashboardSubTab, clientsSubTab, stationsSubTab, paymentsSubTab, reportsSubTab, settingsSubTab]);

  // Add new state variables for chart data after the existing state declarations
  // Real data from MongoDB
  // Add new state variables for chart data after the existing state declarations
  // Real data from MongoDB
  const [stats, setStats] = useState<Stat[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [revenueByCityData, setRevenueByCityData] = useState<any[]>([]);
  const [usageByCityData, setUsageByCityData] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<boolean>(true);

  // Function to update URL parameters
  const updateUrl = (tab: string, subTab: string) => {
    // In a real implementation, you would use router.push with query parameters
    // For now, we'll just log the action
    console.log(`Updating URL: tab=${tab}, subTab=${subTab}`);
  };

  // Enhanced data fetching with better error handling and timeout management
  const fetchData = useCallback(async () => {
    if (status === 'authenticated' && session?.user?.role === 'admin' && !dataFetchedRef.current) {
      dataFetchedRef.current = true;
      
      // Show loader during data fetching
      showLoader("Loading dashboard data...");
      
      // Add timeout to ensure loader doesn't stay visible indefinitely
      const overallTimeoutId = setTimeout(() => {
        setErrorState("Request timeout - please check your network connection and try again");
        hideLoader();
        setLoadingState(false);
      }, 30000); // Increased to 30 seconds for better reliability
      
      try {
        // Fetch all data with individual timeouts and better error handling
        const [
          statsResponse,
          clientsResponse,
          stationsResponse,
          paymentsResponse,
          chartDataResponse
        ] = await Promise.all([
          // Fetch dashboard stats with timeout
          Promise.race([
            fetch('/api/dashboard/stats'),
            new Promise<Response>((_, reject) => 
              setTimeout(() => reject(new Error('Stats fetch timeout')), 15000)
            )
          ]),
          // Fetch clients with timeout
          Promise.race([
            fetch('/api/clients'),
            new Promise<Response>((_, reject) => 
              setTimeout(() => reject(new Error('Clients fetch timeout')), 15000)
            )
          ]),
          // Fetch stations with timeout
          Promise.race([
            fetch('/api/stations'),
            new Promise<Response>((_, reject) => 
              setTimeout(() => reject(new Error('Stations fetch timeout')), 15000)
            )
          ]),
          // Fetch payments with timeout
          Promise.race([
            fetch('/api/payments'),
            new Promise<Response>((_, reject) => 
              setTimeout(() => reject(new Error('Payments fetch timeout')), 15000)
            )
          ]),
          // Fetch chart data with timeout
          Promise.race([
            fetch('/api/dashboard/charts'),
            new Promise<Response>((_, reject) => 
              setTimeout(() => reject(new Error('Chart data fetch timeout')), 15000)
            )
          ])
        ]);
        
        // Clear the overall timeout since we've successfully fetched data
        clearTimeout(overallTimeoutId);
        
        // Process responses
        let statsData = [];
        if (statsResponse.ok) {
          statsData = await statsResponse.json();
        } else {
          const errorData = await statsResponse.json();
          console.warn('Failed to fetch dashboard stats:', errorData.error || 'Unknown error');
          // Continue with empty data rather than failing completely
        }
        
        let clientsData = [];
        if (clientsResponse.ok) {
          const clientsResult = await clientsResponse.json();
          clientsData = clientsResult.data || [];
        } else {
          const errorData = await clientsResponse.json();
          console.warn('Failed to fetch clients:', errorData.error || 'Unknown error');
        }
        
        let stationsData = [];
        if (stationsResponse.ok) {
          const stationsResult = await stationsResponse.json();
          stationsData = stationsResult.data || [];
        } else {
          const errorData = await stationsResponse.json();
          console.warn('Failed to fetch stations:', errorData.error || 'Unknown error');
        }
        
        let paymentsData = [];
        if (paymentsResponse.ok) {
          const paymentsResult = await paymentsResponse.json();
          paymentsData = paymentsResult.data || [];
        } else {
          const errorData = await paymentsResponse.json();
          console.warn('Failed to fetch payments:', errorData.error || 'Unknown error');
        }
        
        let chartData: any = {};
        if (chartDataResponse.ok) {
          chartData = await chartDataResponse.json();
        } else {
          const errorData = await chartDataResponse.json();
          console.warn('Failed to fetch chart data:', errorData.error || 'Unknown error');
        }
        
        // Process report data
        const processedReports = [
          {
            id: '1',
            name: 'Monthly Usage Report',
            dateRange: 'Jan 2023 - Dec 2023',
            status: 'completed',
            generated: 'Dec 31, 2023',
            data: []
          },
          {
            id: '2',
            name: 'Quarterly Financial Report',
            dateRange: 'Oct 2023 - Dec 2023',
            status: 'processing',
            generated: '-',
            data: []
          },
          {
            id: '3',
            name: 'Annual Performance Report',
            dateRange: 'Jan 2023 - Dec 2023',
            status: 'failed',
            generated: '-',
            data: {}
          }
        ];
        
        setStats(statsData);
        setClients(clientsData);
        setStations(stationsData);
        setPayments(paymentsData);
        setUserGrowthData(chartData.userGrowth || []);
        setRevenueByCityData(chartData.revenueByCity || []);
        setUsageByCityData(chartData.usageByCity || []);
        setReports(processedReports); // Set the report data
        
        // Clear timeout if data fetching completes successfully
        clearTimeout(overallTimeoutId);
        
        setLoadingState(false);
        // Keep the loader visible until the component is fully rendered
        // This ensures smooth transition without any background flash
        setTimeout(() => {
          hideLoader(); // Hide loader after data is fetched and UI is ready
        }, 500);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setErrorState(err.message || 'Failed to fetch dashboard data. Please check your network connection and try again.');
        clearTimeout(overallTimeoutId); // Clear timeout on error
        setLoadingState(false);
        // Keep the loader visible a bit longer to show error state
        setTimeout(() => {
          hideLoader(); // Hide loader even if there's an error
        }, 500);
      }
    }
  }, [status, session, showLoader, hideLoader]);

  // Fetch data on component mount - with proper dependencies
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin' && !dataFetchedRef.current) {
      fetchData();
    } else if (status !== 'loading' && (!session || session.user?.role !== 'admin')) {
      // Hide loader and redirect if not authenticated or not admin
      hideLoader();
      router.push('/unauthorized');
    }
  }, [status, session, fetchData]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      hideLoader();
      router.push('/unauthorized');
    }
  }, [session, status, router, hideLoader]);

  // Handle real-time updates
  useEffect(() => {
    if (session?.user?.id) {
      joinUserRoom(session.user.id);
    }
  }, [session, joinUserRoom]);

  // Update local state with real-time data
  useEffect(() => {
    if (realTimeData.clients && realTimeData.clients.length > 0) {
      setClients(realTimeData.clients);
    }
    
    if (realTimeData.stations && realTimeData.stations.length > 0) {
      setStations(realTimeData.stations);
    }
    
    if (realTimeData.payments && realTimeData.payments.length > 0) {
      setPayments(realTimeData.payments);
    }
  }, [realTimeData]);

  // Helper function to safely get property values
  const getSafeProperty = (obj: any, prop: string, defaultValue: any) => {
    if (obj && typeof obj === 'object' && obj.hasOwnProperty(prop) && obj[prop] !== null && obj[prop] !== undefined) {
      return obj[prop];
    }
    return defaultValue;
  };

  // Handle real-time updates with enhanced logic
  useEffect(() => {
    if (updates.length > 0) {
      const latestUpdate: any = updates[updates.length - 1];
      
      if (latestUpdate) {
        switch (latestUpdate.event) {
          case 'client_update':
            // Refresh clients data immediately for real-time updates
            // For better performance, update the local state directly instead of refetching all data
            if (latestUpdate.fullDocument) {
              setClients(prevClients => {
                const existingClientIndex = prevClients.findIndex(client => client._id === latestUpdate.fullDocument?._id);
                if (existingClientIndex >= 0 && latestUpdate.fullDocument) {
                  // Update existing client
                  const updatedClients = [...prevClients];
                  const fullDocument = latestUpdate.fullDocument;
                  if (fullDocument && typeof fullDocument === 'object') {
                    updatedClients[existingClientIndex] = {
                      ...updatedClients[existingClientIndex],
                      ...fullDocument,
                      createdAt: fullDocument?.createdAt !== undefined && fullDocument?.createdAt !== null ? fullDocument?.createdAt : (updatedClients[existingClientIndex]?.createdAt || new Date().toISOString()),
                      lastLogin: fullDocument?.lastLogin !== undefined && fullDocument?.lastLogin !== null ? fullDocument?.lastLogin : (updatedClients[existingClientIndex]?.lastLogin || undefined)
                    };
                  }
                  return updatedClients;
                } else if (latestUpdate.fullDocument) {
                  // Add new client
                  const fullDocument = latestUpdate.fullDocument;
                  if (fullDocument && typeof fullDocument === 'object') {
                    return [...prevClients, {
                      _id: fullDocument._id,
                      name: fullDocument.name || 'Unknown',
                      email: fullDocument.email || '',
                      role: fullDocument.role || 'user',
                      status: fullDocument.status || 'active',
                      lastLogin: fullDocument.lastLogin,
                      createdAt: fullDocument.createdAt || new Date().toISOString()
                    }];
                  } else {
                    return prevClients;
                  }
                } else {
                  return prevClients;
                }
              });
            }
            break;
            
          case 'station_update':
            // Update stations data in real-time
            if (latestUpdate.fullDocument) {
              setStations(prevStations => {
                const existingStationIndex = prevStations.findIndex(station => station._id === latestUpdate.fullDocument?._id);
                if (existingStationIndex >= 0 && latestUpdate.fullDocument) {
                  // Update existing station
                  const updatedStations = [...prevStations];
                  const fullDocument = latestUpdate.fullDocument;
                  if (fullDocument && typeof fullDocument === 'object') {
                    updatedStations[existingStationIndex] = {
                      ...updatedStations[existingStationIndex],
                      ...fullDocument,
                      createdAt: fullDocument?.createdAt !== undefined && fullDocument?.createdAt !== null ? fullDocument?.createdAt : (updatedStations[existingStationIndex]?.createdAt || new Date().toISOString())
                    };
                  }
                  return updatedStations;
                } else if (latestUpdate.fullDocument) {
                  // Add new station
                  const fullDocument = latestUpdate.fullDocument;
                  if (fullDocument && typeof fullDocument === 'object') {
                    return [...prevStations, {
                      _id: fullDocument._id,
                      name: fullDocument.name || 'Unknown Station',
                      address: fullDocument.address || '',
                      city: fullDocument.city || '',
                      status: fullDocument.status || 'active',
                      totalSlots: fullDocument.totalSlots || 0,
                      availableSlots: fullDocument.availableSlots || 0,
                      createdAt: fullDocument.createdAt || new Date().toISOString()
                    }];
                  } else {
                    return prevStations;
                  }
                } else {
                  return prevStations;
                }
              });
              
              // Refresh usage by city chart when stations change
              fetch('/api/dashboard/charts?type=usage-by-city')
                .then(response => response.json())
                .then(data => {
                  if (data.usageByCity) {
                    setUsageByCityData(data.usageByCity);
                  }
                })
                .catch(error => {
                  console.error('Error fetching updated usage by city data:', error);
                });
            }
            break;
            
          case 'client_update':
            // Update clients data in real-time
            if (latestUpdate.fullDocument) {
              setClients(prevClients => {
                const existingClientIndex = prevClients.findIndex(client => client._id === latestUpdate.fullDocument?._id);
                if (existingClientIndex >= 0 && latestUpdate.fullDocument) {
                  // Update existing client
                  const updatedClients = [...prevClients];
                  const fullDocument = latestUpdate.fullDocument;
                  if (fullDocument && typeof fullDocument === 'object') {
                    updatedClients[existingClientIndex] = {
                      ...updatedClients[existingClientIndex],
                      ...fullDocument,
                      createdAt: fullDocument?.createdAt !== undefined && fullDocument?.createdAt !== null ? fullDocument?.createdAt : (updatedClients[existingClientIndex]?.createdAt || new Date().toISOString()),
                      lastLogin: fullDocument?.lastLogin !== undefined && fullDocument?.lastLogin !== null ? fullDocument?.lastLogin : (updatedClients[existingClientIndex]?.lastLogin || undefined)
                    };
                  }
                  return updatedClients;
                } else if (latestUpdate.fullDocument) {
                  // Add new client
                  const fullDocument = latestUpdate.fullDocument;
                  if (fullDocument && typeof fullDocument === 'object') {
                    return [...prevClients, {
                      _id: fullDocument._id,
                      name: fullDocument.name || 'Unknown',
                      email: fullDocument.email || '',
                      role: fullDocument.role || 'user',
                      status: fullDocument.status || 'active',
                      lastLogin: fullDocument.lastLogin,
                      createdAt: fullDocument.createdAt || new Date().toISOString()
                    }];
                  } else {
                    return prevClients;
                  }
                } else {
                  return prevClients;
                }
              });
              
              // Refresh usage by city chart when clients change
              fetch('/api/dashboard/charts?type=usage-by-city')
                .then(response => response.json())
                .then(data => {
                  if (data.usageByCity) {
                    setUsageByCityData(data.usageByCity);
                  }
                })
                .catch(error => {
                  console.error('Error fetching updated usage by city data:', error);
                });
            }
            break;
            
          case 'payment_update':
            // Update payments data in real-time
            if (latestUpdate.fullDocument) {
              setPayments(prevPayments => {
                const existingPaymentIndex = prevPayments.findIndex(payment => payment._id === latestUpdate.fullDocument?._id);
                if (existingPaymentIndex >= 0 && latestUpdate.fullDocument) {
                  // Update existing payment
                  const updatedPayments = [...prevPayments];
                  const fullDocument = latestUpdate.fullDocument;
                  if (fullDocument && typeof fullDocument === 'object') {
                    updatedPayments[existingPaymentIndex] = {
                      ...updatedPayments[existingPaymentIndex],
                      ...fullDocument,
                      createdAt: fullDocument?.createdAt !== undefined && fullDocument?.createdAt !== null ? fullDocument?.createdAt : (updatedPayments[existingPaymentIndex]?.createdAt || new Date().toISOString())
                    };
                  }
                  return updatedPayments;
                } else if (latestUpdate.fullDocument) {
                  // Add new payment
                  const fullDocument = latestUpdate.fullDocument;
                  if (fullDocument && typeof fullDocument === 'object') {
                    return [...prevPayments, {
                      _id: fullDocument._id,
                      userId: fullDocument.userId || '',
                      stationId: fullDocument.stationId || '',
                      orderId: fullDocument.orderId || '',
                      amount: fullDocument.amount || 0,
                      status: fullDocument.status || 'pending',
                      currency: fullDocument.currency || 'INR',
                      method: fullDocument.method,
                      createdAt: fullDocument.createdAt || new Date().toISOString()
                    }];
                  } else {
                    return prevPayments;
                  }
                } else {
                  return prevPayments;
                }
              });
              
              // Refresh all chart data when payments change to ensure consistency
              fetch('/api/dashboard/charts')
                .then(response => response.json())
                .then(data => {
                  if (data.revenueByCity) {
                    setRevenueByCityData(data.revenueByCity);
                  }
                  if (data.usageByCity) {
                    setUsageByCityData(data.usageByCity);
                  }
                  if (data.userGrowth) {
                    setUserGrowthData(data.userGrowth);
                  }
                })
                .catch(error => {
                  console.error('Error fetching updated chart data:', error);
                });
            }
            break;
            
          case 'eco_stats_update':
            // Refresh stats data from Redis cache
            // Instead of refetching all data, we can listen to Redis updates directly
            fetch('/api/dashboard/stats')
              .then(response => response.json())
              .then(statsData => {
                setStats(statsData);
              })
              .catch(error => {
                console.error('Error fetching updated stats:', error);
              });
              
            // Refresh chart data when eco stats change
            fetch('/api/dashboard/charts')
              .then(response => response.json())
              .then(data => {
                if (data.userGrowth) {
                  setUserGrowthData(data.userGrowth);
                }
                if (data.revenueByCity) {
                  setRevenueByCityData(data.revenueByCity);
                }
                if (data.usageByCity) {
                  setUsageByCityData(data.usageByCity);
                }
              })
              .catch(error => {
                console.error('Error fetching updated chart data:', error);
              });
            break;
            
          default:
            console.log('Unknown update event:', latestUpdate.event);
        }
      }
    }
  }, [updates]);

  {/* Main content - Mobile-first responsive design */ }
  if (status === "loading" || loadingState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-[#CBD5E1]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (status === "unauthenticated" || !session || session.user?.role !== 'admin') {
    return null;
  }

  return (
    // Added background gradient for consistency with other dashboard pages
    // Added pt-16 to account for fixed navbar height
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] pt-16">
      <Navbar />
      {/* Page content - Mobile-first responsive design */ }
      <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
        <div className="max-w-full mx-auto w-full">
          {/* Dashboard view */ }
          {activeTab === 'dashboard' && (
            <div className="w-full">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">Admin Powerhouse</h1>
                <p className="text-[#CBD5E1] text-xl">Your central control panel to manage, monitor, and master the system with ease.</p>
                <p className="text-[#CBD5E1] mt-2">Welcome, {session?.user?.name || 'Admin'}. Here's what's happening today.</p>
                {/* Real-time connection status is intentionally hidden for cleaner UI */ }
              </div>
              
              {/* Sub-tabs for Dashboard - Mobile-first responsive design */ }
              <div className="mb-6 border-b border-[#334155] overflow-x-auto">
                <nav className="flex space-x-4 md:space-x-6 min-w-max md:min-w-0">
                  <button
                    onClick={() => {
                      setDashboardSubTab('overview');
                      updateUrl('dashboard', 'overview');
                    }}
                    className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                      dashboardSubTab === 'overview'
                        ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                        : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => {
                      setDashboardSubTab('analytics');
                      updateUrl('dashboard', 'analytics');
                    }}
                    className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                      dashboardSubTab === 'analytics'
                        ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                        : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
                    }`}
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => {
                      setDashboardSubTab('activity');
                      updateUrl('dashboard', 'activity');
                    }}
                    className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
                      dashboardSubTab === 'activity'
                        ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                        : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
                    }`}
                  >
                    Recent Activity
                  </button>
                </nav>
              </div>

              {/* Dashboard content based on sub-tab */ }
              {dashboardSubTab === 'overview' && (
                <DashboardOverview 
                  stats={stats} 
                  userGrowthData={userGrowthData} 
                  revenueByCityData={revenueByCityData} 
                />
              )}
              
              {dashboardSubTab === 'analytics' && (
                <DashboardAnalytics 
                  revenueByCityData={revenueByCityData} 
                  usageByCityData={usageByCityData} 
                />
              )}
              
              {dashboardSubTab === 'activity' && (
                <DashboardActivity 
                  clients={clients} 
                  payments={payments} 
                />
              )}
            </div>
          )}
          
          {/* Clients view - Mobile-first responsive design */ }
          {activeTab === 'clients' && (
            <div className="w-full">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">Admin Powerhouse</h1>
                <p className="text-[#CBD5E1] text-xl">Your central control panel to manage, monitor, and master the system with ease.</p>
              </div>
              <ClientsManagement 
                clients={clients} 
                clientsSubTab={clientsSubTab} 
                setClientsSubTab={setClientsSubTab} 
                updateUrl={updateUrl} 
              />
            </div>
          )}
          
          {/* Stations view - Mobile-first responsive design */ }
          {activeTab === 'stations' && (
            <div className="w-full">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">Admin Powerhouse</h1>
                <p className="text-[#CBD5E1] text-xl">Your central control panel to manage, monitor, and master the system with ease.</p>
              </div>
              <StationsManagement 
                stations={stations} 
                stationsSubTab={stationsSubTab} 
                setStationsSubTab={setStationsSubTab} 
                updateUrl={updateUrl} 
              />
            </div>
          )}
          
          {/* Payments view - Mobile-first responsive design */ }
          {activeTab === 'payments' && (
            <div className="w-full">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">Admin Powerhouse</h1>
                <p className="text-[#CBD5E1] text-xl">Your central control panel to manage, monitor, and master the system with ease.</p>
              </div>
              <PaymentsManagement 
                payments={payments} 
                paymentsSubTab={paymentsSubTab} 
                setPaymentsSubTab={setPaymentsSubTab} 
                updateUrl={updateUrl} 
              />
            </div>
          )}
          
          {/* Reports view - Mobile-first responsive design */ }
          {activeTab === 'reports' && (
            <div className="w-full">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">Admin Powerhouse</h1>
                <p className="text-[#CBD5E1] text-xl">Your central control panel to manage, monitor, and master the system with ease.</p>
              </div>
              <ReportsManagement 
                reports={reports} 
                reportsSubTab={reportsSubTab} 
                setReportsSubTab={setReportsSubTab} 
                updateUrl={updateUrl} 
                usageByCityData={usageByCityData} 
                userGrowthData={userGrowthData} 
                revenueByCityData={revenueByCityData} 
              />
            </div>
          )}

          {/* Settings view - Mobile-first responsive design */ }
          {activeTab === 'settings' && (
            <div className="w-full">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">Admin Powerhouse</h1>
                <p className="text-[#CBD5E1] text-xl">Your central control panel to manage, monitor, and master the system with ease.</p>
              </div>
              <SettingsManagement 
                settingsSubTab={settingsSubTab} 
                setSettingsSubTab={setSettingsSubTab} 
                updateUrl={updateUrl} 
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Wrap the component in Suspense to handle useSearchParams issues in Next.js 15
export default function AdminDashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminDashboardContent />
    </Suspense>
  );
}