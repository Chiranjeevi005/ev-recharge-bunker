import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { LoaderProvider, useLoader } from '@/lib/LoaderContext';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock UniversalLoader component
jest.mock('@/components/ui/UniversalLoader', () => ({
  UniversalLoader: ({ task, state }: { task: string; state: string }) => (
    <div data-testid="universal-loader">
      <span data-testid="loader-task">{task}</span>
      <span data-testid="loader-state">{state}</span>
    </div>
  ),
}));

// Test component that uses the loader context
const TestComponent: React.FC = () => {
  const { isLoading, showLoader, hideLoader, updateLoader } = useLoader();
  
  return (
    <div>
      <div data-testid="loader-status">{isLoading ? 'visible' : 'hidden'}</div>
      <button onClick={() => showLoader('Test task', 'loading')}>Show Loader</button>
      <button onClick={hideLoader}>Hide Loader</button>
      <button onClick={() => updateLoader('Updated task', 'success')}>Update Loader</button>
    </div>
  );
};

describe('LoaderContext', () => {
  it('should provide loader context with initial state', () => {
    render(
      <LoaderProvider>
        <TestComponent />
      </LoaderProvider>
    );
    
    expect(screen.getByTestId('loader-status')).toHaveTextContent('hidden');
  });

  it('should show loader when showLoader is called', () => {
    render(
      <LoaderProvider>
        <TestComponent />
      </LoaderProvider>
    );
    
    // Initially hidden
    expect(screen.getByTestId('loader-status')).toHaveTextContent('hidden');
    
    // Show loader
    act(() => {
      screen.getByText('Show Loader').click();
    });
    
    // Should be visible
    expect(screen.getByTestId('loader-status')).toHaveTextContent('visible');
    expect(screen.getByTestId('loader-task')).toHaveTextContent('Test task');
    expect(screen.getByTestId('loader-state')).toHaveTextContent('loading');
  });

  it('should hide loader when hideLoader is called', () => {
    render(
      <LoaderProvider>
        <TestComponent />
      </LoaderProvider>
    );
    
    // Show loader first
    act(() => {
      screen.getByText('Show Loader').click();
    });
    expect(screen.getByTestId('loader-status')).toHaveTextContent('visible');
    
    // Hide loader
    act(() => {
      screen.getByText('Hide Loader').click();
    });
    
    // Should be hidden (after delay)
    setTimeout(() => {
      expect(screen.getByTestId('loader-status')).toHaveTextContent('hidden');
    }, 350);
  });

  it('should update loader when updateLoader is called', () => {
    render(
      <LoaderProvider>
        <TestComponent />
      </LoaderProvider>
    );
    
    // Show loader first
    act(() => {
      screen.getByText('Show Loader').click();
    });
    expect(screen.getByTestId('loader-task')).toHaveTextContent('Test task');
    expect(screen.getByTestId('loader-state')).toHaveTextContent('loading');
    
    // Update loader
    act(() => {
      screen.getByText('Update Loader').click();
    });
    
    // Should have updated task and state
    expect(screen.getByTestId('loader-task')).toHaveTextContent('Updated task');
    expect(screen.getByTestId('loader-state')).toHaveTextContent('success');
  });
});