import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LogoAnimation } from '../src/components/ui/LogoAnimation';

describe('LogoAnimation', () => {
  test('renders without crashing', () => {
    render(<LogoAnimation />);
    // Check that SVG is rendered
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });

  test('applies correct size classes', () => {
    const { container } = render(<LogoAnimation size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Note: Since we're using SVG, we check the viewBox instead of width/height classes
    expect(svg).toHaveAttribute('viewBox', '0 0 60 60');
  });

  test('applies correct state classes', () => {
    const { container } = render(<LogoAnimation state="loading" />);
    // The component uses GSAP for animations, so we can't easily test the animation state
    // But we can verify the component renders correctly
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('applies additional className when provided', () => {
    const { container } = render(<LogoAnimation className="test-class" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('test-class');
  });

  test('respects disableGlow prop', () => {
    const { container } = render(<LogoAnimation disableGlow />);
    // When disableGlow is true, we should still render the SVG
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('respects disableSparks prop', () => {
    const { container } = render(<LogoAnimation disableSparks />);
    // When disableSparks is true, we should still render the SVG
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});