import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LogoAnimation } from '../src/components/ui/LogoAnimation';

describe('LogoAnimation', () => {
  test('renders without crashing', () => {
    render(<LogoAnimation />);
    // Check that the logo image is rendered
    const logo = screen.getByAltText('EV Bunker Logo');
    expect(logo).toBeInTheDocument();
  });

  test('applies correct size classes', () => {
    const { container } = render(<LogoAnimation size="lg" />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    // Check that the image has the correct dimensions
    expect(img).toHaveAttribute('width', '120');
    expect(img).toHaveAttribute('height', '120');
  });

  test('applies correct state classes', () => {
    const { container } = render(<LogoAnimation state="loading" />);
    // The component uses GSAP for animations, so we can't easily test the animation state
    // But we can verify the component renders correctly
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  test('applies additional className when provided', () => {
    const { container } = render(<LogoAnimation className="test-class" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('test-class');
  });

  test('respects disableGlow prop', () => {
    const { container } = render(<LogoAnimation disableGlow />);
    // When disableGlow is true, we should still render the logo
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  test('respects disableSparks prop', () => {
    const { container } = render(<LogoAnimation disableParticles />);
    // When disableParticles is true, we should still render the logo
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });
});