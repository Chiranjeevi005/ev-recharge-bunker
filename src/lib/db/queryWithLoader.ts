import { connectToDatabase } from './connection';

interface QueryOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Utility function to execute database queries with loader integration
 * @param queryFn - The database query function to execute
 * @param options - Options for loader messages
 * @returns The result of the query function
 */
export async function queryWithLoader<T>(
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): Promise<T> {
  const {
    loadingMessage = "Fetching data...",
    successMessage = "Data loaded successfully",
    errorMessage = "Failed to load data"
  } = options;

  // In a real implementation, we would use the loader context here
  // For now, we'll just execute the query and handle errors
  try {
    // Show loader
    console.log(`[Loader] ${loadingMessage}`);
    
    // Execute the query
    const result = await queryFn();
    
    // Show success
    console.log(`[Loader] ${successMessage}`);
    
    return result;
  } catch (error) {
    // Show error
    console.error(`[Loader] ${errorMessage}:`, error);
    throw error;
  }
}

/**
 * Utility function to fetch stations with loader integration
 * @param setLoadingMessage - Function to update the loader message
 * @returns Array of stations
 */
export async function fetchStationsWithLoader(setLoadingMessage?: (message: string) => void) {
  try {
    if (setLoadingMessage) {
      setLoadingMessage("Finding charging stations...");
    }
    
    const { db } = await connectToDatabase();
    const stations = await db.collection("stations").find({}).toArray();
    
    if (setLoadingMessage) {
      setLoadingMessage("Stations loaded successfully");
    }
    
    // Convert ObjectId to string for JSON serialization
    return stations.map((station: any) => ({
      ...station,
      _id: station._id.toString(),
      slots: station.slots || []
    }));
  } catch (error) {
    if (setLoadingMessage) {
      setLoadingMessage("Failed to load stations");
    }
    console.error("Error fetching stations:", error);
    throw error;
  }
}

/**
 * Utility function to fetch bookings with loader integration
 * @param userId - The user ID to fetch bookings for
 * @param setLoadingMessage - Function to update the loader message
 * @returns Array of bookings
 */
export async function fetchBookingsWithLoader(userId: string, setLoadingMessage?: (message: string) => void) {
  try {
    if (setLoadingMessage) {
      setLoadingMessage("Fetching your bookings...");
    }
    
    const { db } = await connectToDatabase();
    const bookings = await db.collection("bookings").find({ userId }).toArray();
    
    if (setLoadingMessage) {
      setLoadingMessage("Bookings loaded successfully");
    }
    
    // Convert ObjectId to string for JSON serialization
    return bookings.map((booking: any) => ({
      ...booking,
      _id: booking._id.toString(),
    }));
  } catch (error) {
    if (setLoadingMessage) {
      setLoadingMessage("Failed to load bookings");
    }
    console.error("Error fetching bookings:", error);
    throw error;
  }
}

/**
 * Utility function to fetch payment history with loader integration
 * @param userId - The user ID to fetch payments for
 * @param setLoadingMessage - Function to update the loader message
 * @returns Array of payments
 */
export async function fetchPaymentsWithLoader(userId: string, setLoadingMessage?: (message: string) => void) {
  try {
    if (setLoadingMessage) {
      setLoadingMessage("Fetching payment history...");
    }
    
    const { db } = await connectToDatabase();
    const payments = await db.collection("payments").find({ userId }).toArray();
    
    if (setLoadingMessage) {
      setLoadingMessage("Payment history loaded successfully");
    }
    
    // Convert ObjectId to string for JSON serialization
    return payments.map((payment: any) => ({
      ...payment,
      _id: payment._id.toString(),
    }));
  } catch (error) {
    if (setLoadingMessage) {
      setLoadingMessage("Failed to load payment history");
    }
    console.error("Error fetching payments:", error);
    throw error;
  }
}