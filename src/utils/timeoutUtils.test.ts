import { fetchWithTimeout } from './fetchWithTimeout';
import { vercelTimeoutGuard } from './vercelTimeoutGuard';

/**
 * Simple test suite for timeout utilities
 */

// Mock fetch for testing
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
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'test' })
    });

    const result = await fetchWithTimeout('https://example.com');
    
    expect(result.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    );
  });

  it('should timeout when request takes too long', async () => {
    // Mock a delayed response that exceeds timeout
    (global.fetch as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ ok: true });
        }, 20000); // 20 seconds
      });
    });

    // Expect timeout error
    await expect(fetchWithTimeout('https://example.com', { timeout: 1000 }))
      .rejects
      .toThrow('Request timeout after 1000ms');
  });
});

describe('vercelTimeoutGuard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call onTimeout callback when time expires', () => {
    const onTimeout = jest.fn();
    const cleanup = vercelTimeoutGuard(1000, onTimeout);
    
    // Fast-forward until timer has been executed
    jest.advanceTimersByTime(1000);
    
    expect(onTimeout).toHaveBeenCalled();
    
    // Cleanup
    cleanup();
  });

  it('should not call onTimeout if cleaned up early', () => {
    const onTimeout = jest.fn();
    const cleanup = vercelTimeoutGuard(1000, onTimeout);
    
    // Clean up before timeout
    cleanup();
    
    // Fast-forward past timeout
    jest.advanceTimersByTime(1000);
    
    expect(onTimeout).not.toHaveBeenCalled();
  });
});