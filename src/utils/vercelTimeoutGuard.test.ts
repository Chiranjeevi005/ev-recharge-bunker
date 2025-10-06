import { vercelTimeoutGuard } from './vercelTimeoutGuard';

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

  it('should use default timeout of 55 seconds', () => {
    const onTimeout = jest.fn();
    const cleanup = vercelTimeoutGuard(undefined, onTimeout);
    
    // Fast-forward to just before default timeout
    jest.advanceTimersByTime(54999);
    expect(onTimeout).not.toHaveBeenCalled();
    
    // Fast-forward to default timeout
    jest.advanceTimersByTime(1);
    expect(onTimeout).toHaveBeenCalled();
    
    cleanup();
  });

  it('should handle errors in onTimeout callback', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const onTimeout = jest.fn(() => {
      throw new Error('Test error');
    });
    
    const cleanup = vercelTimeoutGuard(1000, onTimeout);
    
    // Fast-forward until timer has been executed
    jest.advanceTimersByTime(1000);
    
    expect(onTimeout).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Vercel Timeout Guard] Error in onTimeout handler:',
      expect.any(Error)
    );
    
    // Cleanup
    cleanup();
    consoleErrorSpy.mockRestore();
  });
});