import { useLoader } from './LoaderContext';

interface MapOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Utility function to load map data with loader integration
 * @param loadFn - The map data loading function
 * @param options - Options for loader messages
 * @returns The result of the load function
 */
export async function loadMapDataWithLoader<T>(
  loadFn: () => Promise<T>,
  options: MapOptions = {}
) {
  const {
    loadingMessage = "Loading map data...",
    successMessage = "Map data loaded successfully",
    errorMessage = "Failed to load map data"
  } = options;

  const { showLoader, hideLoader, updateLoader } = useLoader();

  try {
    // Show loading state
    showLoader(loadingMessage, 'loading');
    
    // Execute the map data loading function
    const result = await loadFn();
    
    // Update loader to success state
    updateLoader(successMessage, 'success');
    
    // Hide loader after delay
    setTimeout(() => {
      hideLoader();
    }, 1000);
    
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Map data loading failed';
    updateLoader(`${errorMessage}: ${errorMsg}`, 'error');
    
    // Hide loader after delay
    setTimeout(() => {
      hideLoader();
    }, 2000);
    
    throw error;
  }
}

/**
 * Custom hook for loading map data with the universal loader
 * @returns Object with map loading functions and state
 */
export function useMapLoader() {
  const { showLoader, hideLoader, updateLoader } = useLoader();
  
  const loadMapData = async <T>(
    loadFn: () => Promise<T>,
    options: MapOptions = {}
  ) => {
    const {
      loadingMessage = "Loading map data...",
      successMessage = "Map data loaded successfully",
      errorMessage = "Failed to load map data"
    } = options;
    
    try {
      // Show loading state
      showLoader(loadingMessage, 'loading');
      
      // Execute the map data loading function
      const result = await loadFn();
      
      // Update loader to success state
      updateLoader(successMessage, 'success');
      
      // Hide loader after delay
      setTimeout(() => {
        hideLoader();
      }, 1000);
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Map data loading failed';
      updateLoader(`${errorMessage}: ${errorMsg}`, 'error');
      
      // Hide loader after delay
      setTimeout(() => {
        hideLoader();
      }, 2000);
      
      throw error;
    }
  };
  
  const findNearbyStations = async (location: { lat: number; lng: number }) => {
    try {
      // Show loading state
      showLoader("Finding nearby charging stations...", 'loading');
      
      // Simulate API call to find nearby stations
      // In a real implementation, this would be an actual API call
      const response = await fetch(`/api/stations?lat=${location.lat}&lng=${location.lng}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby stations');
      }
      
      const stations = await response.json();
      
      // Update loader to success state
      updateLoader("Found nearby charging stations", 'success');
      
      // Hide loader after delay
      setTimeout(() => {
        hideLoader();
      }, 1000);
      
      return stations;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to find nearby stations';
      updateLoader(`Error: ${errorMsg}`, 'error');
      
      // Hide loader after delay
      setTimeout(() => {
        hideLoader();
      }, 2000);
      
      throw error;
    }
  };
  
  const reserveSlot = async (stationId: string, slotId: string) => {
    try {
      // Show loading state
      showLoader("Reserving charging slot...", 'loading');
      
      // Simulate API call to reserve a slot
      // In a real implementation, this would be an actual API call
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stationId, slotId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reserve slot');
      }
      
      const booking = await response.json();
      
      // Update loader to success state
      updateLoader("Slot reserved successfully!", 'success');
      
      // Hide loader after delay
      setTimeout(() => {
        hideLoader();
      }, 1500);
      
      return booking;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to reserve slot';
      updateLoader(`Reservation failed: ${errorMsg}`, 'error');
      
      // Hide loader after delay
      setTimeout(() => {
        hideLoader();
      }, 2000);
      
      throw error;
    }
  };
  
  return { loadMapData, findNearbyStations, reserveSlot };
}