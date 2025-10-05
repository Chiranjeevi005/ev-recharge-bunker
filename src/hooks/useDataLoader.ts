import { useState, useEffect } from 'react';
import { useLoader } from '@/context/LoaderContext';
import { connectToDatabase } from '@/lib/db/connection';

interface DataLoaderOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Custom hook for loading data with the universal loader
 * @param queryFn - The database query function to execute
 * @param options - Options for loader messages
 * @returns Object with data, loading state, and error
 */
export function useDataLoader<T>(
  queryFn: () => Promise<T>,
  options: DataLoaderOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showLoader, hideLoader, updateLoader } = useLoader();

  const {
    loadingMessage = "Loading data...",
    successMessage = "Data loaded successfully",
    errorMessage = "Failed to load data"
  } = options;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    showLoader(loadingMessage);

    try {
      const result = await queryFn();
      setData(result);
      updateLoader(successMessage, 'success');
      // Hide loader after a short delay to show success state
      setTimeout(() => {
        hideLoader();
      }, 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      updateLoader(errorMessage, 'error');
      // Hide loader after a short delay to show error state
      setTimeout(() => {
        hideLoader();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, loadData };
}

/**
 * Custom hook for fetching stations with the universal loader
 * @returns Object with stations data, loading state, and error
 */
export function useStations() {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showLoader, hideLoader, updateLoader } = useLoader();

  const fetchStations = async () => {
    setLoading(true);
    setError(null);
    showLoader("Finding charging stations...");

    try {
      const { db } = await connectToDatabase();
      const stationsData = await db.collection("stations").find({}).toArray();
      
      // Convert ObjectId to string for JSON serialization
      const serializedStations = stationsData.map((station: any) => ({
        ...station,
        _id: station._id.toString(),
        slots: station.slots || []
      }));
      
      setStations(serializedStations);
      updateLoader("Stations loaded successfully", 'success');
      // Hide loader after a short delay to show success state
      setTimeout(() => {
        hideLoader();
      }, 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      updateLoader("Failed to load stations", 'error');
      // Hide loader after a short delay to show error state
      setTimeout(() => {
        hideLoader();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return { stations, loading, error, fetchStations };
}

/**
 * Custom hook for fetching bookings with the universal loader
 * @param userId - The user ID to fetch bookings for
 * @returns Object with bookings data, loading state, and error
 */
export function useBookings(userId: string) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showLoader, hideLoader, updateLoader } = useLoader();

  const fetchBookings = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    showLoader("Fetching your bookings...");

    try {
      const { db } = await connectToDatabase();
      const bookingsData = await db.collection("bookings").find({ userId }).toArray();
      
      // Convert ObjectId to string for JSON serialization
      const serializedBookings = bookingsData.map((booking: any) => ({
        ...booking,
        _id: booking._id.toString(),
      }));
      
      setBookings(serializedBookings);
      updateLoader("Bookings loaded successfully", 'success');
      // Hide loader after a short delay to show success state
      setTimeout(() => {
        hideLoader();
      }, 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      updateLoader("Failed to load bookings", 'error');
      // Hide loader after a short delay to show error state
      setTimeout(() => {
        hideLoader();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return { bookings, loading, error, fetchBookings };
}

/**
 * Custom hook for fetching payment history with the universal loader
 * @param userId - The user ID to fetch payments for
 * @returns Object with payments data, loading state, and error
 */
export function usePayments(userId: string) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showLoader, hideLoader, updateLoader } = useLoader();

  const fetchPayments = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    showLoader("Fetching payment history...");

    try {
      const { db } = await connectToDatabase();
      const paymentsData = await db.collection("payments").find({ userId }).toArray();
      
      // Convert ObjectId to string for JSON serialization
      const serializedPayments = paymentsData.map((payment: any) => ({
        ...payment,
        _id: payment._id.toString(),
      }));
      
      setPayments(serializedPayments);
      updateLoader("Payment history loaded successfully", 'success');
      // Hide loader after a short delay to show success state
      setTimeout(() => {
        hideLoader();
      }, 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      updateLoader("Failed to load payment history", 'error');
      // Hide loader after a short delay to show error state
      setTimeout(() => {
        hideLoader();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return { payments, loading, error, fetchPayments };
}