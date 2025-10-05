import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EcoJourneyHighlights } from '@/components/dashboard/EcoJourneyHighlights';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      totalDistance: 1200,
      co2Prevented: 95,
      rankPercentile: 5
    })
  } as Response)
);

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => 'test-user'),
    setItem: jest.fn(),
  },
  writable: true,
});

describe('EcoJourneyHighlights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Eco Journey Highlights section with correct title and subtitle', () => {
    render(<EcoJourneyHighlights />);
    
    expect(screen.getByText('🌍 Eco Journey Highlights')).toBeInTheDocument();
    expect(screen.getByText('See how your EV journey is driving change, saving the planet, and making you a part of the green revolution.')).toBeInTheDocument();
  });

  it('displays all three eco highlights', async () => {
    render(<EcoJourneyHighlights />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Clean Energy Distance')).toBeInTheDocument();
      expect(screen.getByText('Carbon Impact')).toBeInTheDocument();
      expect(screen.getByText('Green Contributor Rank')).toBeInTheDocument();
    });
  });

  it('displays correct highlight descriptions', async () => {
    render(<EcoJourneyHighlights />);
    
    await waitFor(() => {
      expect(screen.getByText("You've driven 1,200 km on clean energy")).toBeInTheDocument();
      expect(screen.getByText("Your EV charging saved 95 kg CO₂ – equal to planting 0 trees")).toBeInTheDocument();
      expect(screen.getByText("You're in the Top 5% eco-contributors in your city this month")).toBeInTheDocument();
    });
  });

  it('fetches and displays eco highlights data', async () => {
    render(<EcoJourneyHighlights />);
    
    await waitFor(() => {
      // Check if the values are displayed
      expect(screen.getByText('1,200 km')).toBeInTheDocument();
      expect(screen.getByText('95 kg')).toBeInTheDocument();
      expect(screen.getByText('5%')).toBeInTheDocument();
    });
    
    // Verify fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith('/api/dashboard/environmental-impact?userId=test-user');
  });

  it('shows loading state initially', async () => {
    render(<EcoJourneyHighlights />);
    
    // Initially should show loading
    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBeGreaterThan(0);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});