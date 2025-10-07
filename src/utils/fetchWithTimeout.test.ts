import { fetchWithTimeout, fetchJsonWithTimeout } from './fetchWithTimeout';

// Mock the global fetch function
global.fetch = jest.fn();

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should fetch successfully within timeout', async () => {
    // Mock a successful response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('Success'),
      json: () => Promise.resolve({ message: 'Success' })
    });

    const response = await fetchWithTimeout('https://example.com', { timeout: 5000 });
    
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    );
  });

  it('should timeout when request takes too long', async () => {
    // Mock a delayed response
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      return new Promise((resolve, reject) => {
        // Listen for abort signal
        options.signal.addEventListener('abort', () => {
          // Simulate the actual AbortError that AbortController throws
          const error = new Error('The user aborted a request.');
          error.name = 'AbortError';
          reject(error);
        });
        
        // Don't resolve or reject - simulate hanging request
      });
    });

    // Test with a short timeout
    const fetchPromise = fetchWithTimeout('https://example.com', { timeout: 1000 });
    
    // Advance timers to trigger timeout
    jest.advanceTimersByTime(1000);
    
    await expect(fetchPromise).rejects.toThrow('Request timeout after 1000ms');
  }, 10000); // Set test timeout to 10 seconds

  it('should handle network errors', async () => {
    // Mock a network error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(fetchWithTimeout('https://example.com'))
      .rejects
      .toThrow('Network error');
  });
});

describe('fetchJsonWithTimeout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should fetch and parse JSON successfully', async () => {
    // Mock a successful JSON response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'test', value: 123 })
    });

    const result = await fetchJsonWithTimeout<{ data: string; value: number }>('https://api.example.com/data');
    
    expect(result).toEqual({ data: 'test', value: 123 });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    );
  });

  it('should throw error for non-OK responses', async () => {
    // Mock a 500 error response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(fetchJsonWithTimeout('https://api.example.com/error'))
      .rejects
      .toThrow('HTTP error! status: 500');
  });

  it('should throw error for invalid JSON', async () => {
    // Mock a response with invalid JSON
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('Invalid JSON'))
    });

    await expect(fetchJsonWithTimeout('https://api.example.com/invalid-json'))
      .rejects
      .toThrow('Failed to parse JSON response');
  });
});