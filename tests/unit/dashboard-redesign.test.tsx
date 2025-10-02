import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnvironmentalImpact } from '../src/components/dashboard/EnvironmentalImpact';
import { EcoHighlights } from '../src/components/dashboard/EcoHighlights';
import SlotAvailabilityCard from '../src/components/dashboard/SlotAvailabilityCard';

// Mock the motion components from framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  useAnimation: () => ({ start: jest.fn() }),
  useInView: () => [null, false],
}));

// Mock the Button component
jest.mock('../src/components/ui/Button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

describe('Dashboard Redesign Components', () => {
  test('renders EnvironmentalImpact component with all stats', () => {
    render(<EnvironmentalImpact />);
    
    expect(screen.getByText('Your Environmental Impact')).toBeInTheDocument();
    expect(screen.getByText('Total CO2 Saved')).toBeInTheDocument();
    expect(screen.getByText('Sessions Completed')).toBeInTheDocument();
    expect(screen.getByText('Total kWh Charged')).toBeInTheDocument();
    expect(screen.getByText('Equivalent Trees Saved 🌳')).toBeInTheDocument();
  });

  test('renders EcoHighlights component with all highlights', () => {
    render(<EcoHighlights />);
    
    expect(screen.getByText('Eco Journey Highlights')).toBeInTheDocument();
    expect(screen.getByText('Clean Energy Milestone')).toBeInTheDocument();
    expect(screen.getByText('You\'ve driven 1200 km on clean energy')).toBeInTheDocument();
    expect(screen.getByText('CO2 Savings')).toBeInTheDocument();
    expect(screen.getByText('Your EV charging saved 95kg CO2 – equal to planting 4 trees')).toBeInTheDocument();
    expect(screen.getByText('Top Contributor')).toBeInTheDocument();
    expect(screen.getByText('Top 5% green contributors in your city this month')).toBeInTheDocument();
  });

  test('renders SlotAvailabilityCard component with sample data', () => {
    const mockAvailability = [
      {
        stationId: '1',
        stationName: 'Delhi Metro Station',
        slotsAvailable: 5,
        waitingTime: '5 mins',
        location: 'New Delhi',
      },
      {
        stationId: '2',
        stationName: 'Connaught Place Charging Point',
        slotsAvailable: 2,
        waitingTime: '15 mins',
        location: 'Connaught Place, New Delhi',
      },
    ];

    render(<SlotAvailabilityCard availability={mockAvailability} onBookSlot={jest.fn()} />);
    
    expect(screen.getByText('Slot Availability')).toBeInTheDocument();
    expect(screen.getByText('Delhi Metro Station')).toBeInTheDocument();
    expect(screen.getByText('Connaught Place Charging Point')).toBeInTheDocument();
  });
});