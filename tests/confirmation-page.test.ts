/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js router and search params
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue('test-booking-id'),
  }),
}));

// Mock fetch API
global.fetch = jest.fn();

// Mock all components used in the confirmation page
jest.mock('@/components/landing/Navbar', () => {
  return {
    Navbar: () => React.createElement('div', null, 'Navbar'),
  };
});

jest.mock('@/components/landing/Footer', () => {
  return {
    Footer: () => React.createElement('div', null, 'Footer'),
  };
});

jest.mock('@/components/ui/Button', () => {
  return {
    Button: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => 
      React.createElement('button', { onClick }, children),
  };
});

jest.mock('@/components/ui/SuccessAnimation', () => {
  return {
    SuccessAnimation: () => React.createElement('div', null, 'Success Animation'),
  };
});

// Dynamically import the component to avoid SSR issues
let ConfirmationPage: React.ComponentType;

beforeAll(async () => {
  const module = await import('@/app/confirmation/page');
  ConfirmationPage = module.default;
});

describe('Confirmation Page', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders error state when booking is not found', async () => {
    // Mock fetch to return empty array
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce([]),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce([]),
      });

    render(React.createElement(ConfirmationPage));
    
    // Wait for the component to update and check for error text
    expect(await screen.findByText((content, element) => {
      return content.includes('Booking not found');
    })).toBeInTheDocument();
  });
});