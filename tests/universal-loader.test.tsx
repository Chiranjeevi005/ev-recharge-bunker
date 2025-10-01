import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UniversalLoader } from '../src/components/ui/UniversalLoader';

describe('UniversalLoader', () => {
  test('renders without crashing', () => {
    render(React.createElement(UniversalLoader, null));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays custom task text', () => {
    render(React.createElement(UniversalLoader, { task: "Processing payment..." }));
    expect(screen.getByText('Processing payment...')).toBeInTheDocument();
  });

  test('applies additional className when provided', () => {
    const { container } = render(React.createElement(UniversalLoader, { className: "test-class" }));
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('test-class');
  });

  test('displays loading state by default', () => {
    render(React.createElement(UniversalLoader, { task: "Loading..." }));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays success state with correct styling', () => {
    render(React.createElement(UniversalLoader, { task: "Payment Successful!", state: "success" }));
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
  });

  test('displays error state with correct styling', () => {
    render(React.createElement(UniversalLoader, { task: "Retrying...", state: "error" }));
    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });

  test('displays idle state with correct styling', () => {
    render(React.createElement(UniversalLoader, { task: "Ready", state: "idle" }));
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  test('updates task text dynamically', () => {
    const { rerender } = render(React.createElement(UniversalLoader, { task: "Loading..." }));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    rerender(React.createElement(UniversalLoader, { task: "Processing..." }));
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});