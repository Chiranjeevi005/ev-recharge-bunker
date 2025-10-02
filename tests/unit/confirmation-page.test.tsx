import React from 'react';
import { render, screen } from '@testing-library/react';
import ConfirmationPage from '@/app/confirmation/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn().mockReturnValue('test-booking-id'),
    };
  },
}));

// Mock components
jest.mock('@/components/landing/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

jest.mock('@/components/landing/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

jest.mock('@/components/ui/SuccessAnimation', () => ({
  SuccessAnimation: () => <div data-testid="success-animation">Success Animation</div>,
}));

describe('ConfirmationPage', () => {
  it('renders without crashing', () => {
    render(<ConfirmationPage />);
    expect(screen.getByText('Loading booking details...')).toBeInTheDocument();
  });
});