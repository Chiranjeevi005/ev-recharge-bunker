import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BusinessStats } from '@/components/dashboard/BusinessStats';

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
      fuelSavings: 5000,
      petrolOffset: 67,
      evDistance: 1200,
      evContribution: 0.17
    })
  } as Response)
);

describe('BusinessStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Business Stats section with correct title', () => {
    render(<BusinessStats />);
    
    expect(screen.getByText('Your EV Journey Impact')).toBeInTheDocument();
    expect(screen.getByText("You are driving the EV Revolution 🚀 — Saving costs, fuel, and the planet.")).toBeInTheDocument();
  });

  it('displays all four business metrics', async () => {
    render(<BusinessStats />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Fuel Cost Savings')).toBeInTheDocument();
      expect(screen.getByText('Petrol Offset')).toBeInTheDocument();
      expect(screen.getByText('EV Distance Driven')).toBeInTheDocument();
      expect(screen.getByText('EV Revolution Contribution')).toBeInTheDocument();
    });
  });

  it('displays correct metric descriptions', async () => {
    render(<BusinessStats />);
    
    await waitFor(() => {
      expect(screen.getByText("Every km saves your money and fuels a cleaner tomorrow.")).toBeInTheDocument();
      expect(screen.getByText("Liters of fuel you prevented from burning.")).toBeInTheDocument();
      expect(screen.getByText("Distance you've driven clean and green.")).toBeInTheDocument();
      expect(screen.getByText("Your share in shaping an eco-friendly future.")).toBeInTheDocument();
    });
  });

  it('fetches and displays business stats data', async () => {
    render(<BusinessStats />);
    
    await waitFor(() => {
      // Check if the values are displayed (they might be animated, so we check for the elements)
      const statElements = screen.getAllByText(/^[0-9,]+/); // Match numbers with commas
      expect(statElements.length).toBeGreaterThan(0);
    });
    
    // Verify fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith('/api/dashboard/environmental-impact?userId=test-user-id');
  });
});