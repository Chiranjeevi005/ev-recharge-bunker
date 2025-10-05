import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { JourneyImpactStats } from '@/components/dashboard/JourneyImpactStats';
import { LoaderProvider } from '@/lib/LoaderContext';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }
    },
    status: 'authenticated'
  })
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      totalKWh: 120.5,
      totalDuration: 180,
      co2Prevented: 102,
      costSavings: 4320,
      rankPercentile: 85,
      totalDistance: 723
    })
  } as Response)
);

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  return jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn()
  }));
});

// Wrapper component that provides the LoaderContext
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <LoaderProvider>{children}</LoaderProvider>;
};

describe('JourneyImpactStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Journey Impact Stats section with correct title', () => {
    render(
      <TestWrapper>
        <JourneyImpactStats />
      </TestWrapper>
    );
    
    expect(screen.getByText('🌍 Your EV Journey Impact')).toBeInTheDocument();
    expect(screen.getByText("Track your growing contribution to a cleaner planet — every charge, payment, and minute counts.")).toBeInTheDocument();
  });

  it('displays all five journey impact metrics', async () => {
    render(
      <TestWrapper>
        <JourneyImpactStats />
      </TestWrapper>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Green Energy Charged')).toBeInTheDocument();
      expect(screen.getByText('CO₂ Emissions Prevented')).toBeInTheDocument();
      expect(screen.getByText('Station Usage Duration')).toBeInTheDocument();
      expect(screen.getByText('Cost Savings vs. Petrol')).toBeInTheDocument();
      expect(screen.getByText('Community Impact Rank')).toBeInTheDocument();
    });
  });

  it('displays correct metric descriptions', async () => {
    render(
      <TestWrapper>
        <JourneyImpactStats />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText("⚡ Every kWh charged fuels a cleaner tomorrow!")).toBeInTheDocument();
      expect(screen.getByText("🌱 You're saving the planet — one charge at a time.")).toBeInTheDocument();
      expect(screen.getByText("🕒 Time well spent! Every minute drives change.")).toBeInTheDocument();
      expect(screen.getByText("💰 Your smart choice saves both money and Earth!")).toBeInTheDocument();
      expect(screen.getByText("🏆 You're among the top eco-warriors this week!")).toBeInTheDocument();
    });
  });

  it('fetches and displays journey impact stats data', async () => {
    render(
      <TestWrapper>
        <JourneyImpactStats />
      </TestWrapper>
    );
    
    await waitFor(() => {
      // Check if the values are displayed (they might be animated, so we check for the elements)
      const statElements = screen.getAllByText(/^[0-9,]+/); // Match numbers with commas
      expect(statElements.length).toBeGreaterThan(0);
    });
    
    // Verify fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith('/api/dashboard/environmental-impact?userId=test-user-id');
  });
});