/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ApiLoadingIndicator } from '@/components/ui/ApiLoadingIndicator';
import '@testing-library/jest-dom';

describe('ApiLoadingIndicator', () => {
  it('renders with default props', () => {
    render(React.createElement(ApiLoadingIndicator, null));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(React.createElement(ApiLoadingIndicator, { message: "Fetching data..." }));
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('renders in different sizes', () => {
    const { container: smContainer } = render(React.createElement(ApiLoadingIndicator, { size: "sm" }));
    const { container: mdContainer } = render(React.createElement(ApiLoadingIndicator, { size: "md" }));
    const { container: lgContainer } = render(React.createElement(ApiLoadingIndicator, { size: "lg" }));
    
    // Just verify they render without errors
    expect(smContainer).toBeInTheDocument();
    expect(mdContainer).toBeInTheDocument();
    expect(lgContainer).toBeInTheDocument();
  });

  it('renders with overlay when enabled', () => {
    const { container } = render(React.createElement(ApiLoadingIndicator, { overlay: true }));
    expect(container.firstChild).toHaveClass('fixed');
  });

  it('renders without overlay by default', () => {
    const { container } = render(React.createElement(ApiLoadingIndicator, null));
    expect(container.firstChild).not.toHaveClass('fixed');
  });
});