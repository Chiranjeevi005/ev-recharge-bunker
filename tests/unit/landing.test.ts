/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/landing/HeroSection';
import '@testing-library/jest-dom';

describe('Landing Page Components', () => {
  it('renders HeroSection component', () => {
    render(React.createElement(HeroSection, null));
    expect(screen.getByText('Book a Slot')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});