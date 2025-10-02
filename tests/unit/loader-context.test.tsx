import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoaderProvider, useLoader } from '../src/lib/LoaderContext';
import { UniversalLoader } from '../src/components/ui/UniversalLoader';

// Test component that uses the loader context
const TestComponent: React.FC = () => {
  const { showLoader, hideLoader, updateLoader } = useLoader();
  
  return (
    <div>
      <button onClick={() => showLoader('Loading data...')}>Show Loader</button>
      <button onClick={() => updateLoader('Processing payment...', 'success')}>Update to Success</button>
      <button onClick={hideLoader}>Hide Loader</button>
    </div>
  );
};

describe('LoaderContext', () => {
  test('provides loader context to child components', () => {
    render(
      <LoaderProvider>
        <TestComponent />
      </LoaderProvider>
    );
    
    expect(screen.getByText('Show Loader')).toBeInTheDocument();
    expect(screen.getByText('Update to Success')).toBeInTheDocument();
    expect(screen.getByText('Hide Loader')).toBeInTheDocument();
  });

  test('shows loader when showLoader is called', async () => {
    const TestWithLoader: React.FC = () => {
      const { showLoader } = useLoader();
      
      React.useEffect(() => {
        showLoader('Loading data...');
      }, [showLoader]);
      
      return <div>Test Component</div>;
    };
    
    render(
      <LoaderProvider>
        <TestWithLoader />
      </LoaderProvider>
    );
    
    // Wait for the loader to appear
    await waitFor(() => {
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });
  });

  test('hides loader when hideLoader is called', async () => {
    const TestWithHide: React.FC = () => {
      const { showLoader, hideLoader } = useLoader();
      
      React.useEffect(() => {
        showLoader('Loading data...');
        setTimeout(() => hideLoader(), 100);
      }, [showLoader, hideLoader]);
      
      return <div>Test Component</div>;
    };
    
    render(
      <LoaderProvider>
        <TestWithHide />
      </LoaderProvider>
    );
    
    // Loader should appear first
    await waitFor(() => {
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });
    
    // Then disappear after hideLoader is called
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    }, { timeout: 2000 }); // Increased to 2000ms to allow for animation completion
  });
});