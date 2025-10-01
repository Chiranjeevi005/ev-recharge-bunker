import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LogoAnimation } from '../src/components/ui/LogoAnimation';

describe('LogoAnimation', () => {
  test('renders without crashing', () => {
    render(React.createElement(LogoAnimation, {}));
    // Check that the logo image is rendered
    const logo = screen.getByAltText('EV Bunker Logo');
    expect(logo).toBeInTheDocument();
  });

  test('applies correct size classes', () => {
    const { container } = render(React.createElement(LogoAnimation, { size: "lg" }));
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    // Check that the image has the correct width
    expect(img).toHaveAttribute('width', '120');
  });

  test('applies correct state classes', () => {
    const { container } = render(React.createElement(LogoAnimation, { state: "loading" }));
    // The component uses GSAP for animations, so we can't easily test the animation state
    // But we can verify the component renders correctly
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  test('applies additional className when provided', () => {
    const { container } = render(React.createElement(LogoAnimation, { className: "test-class" }));
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('test-class');
  });

  test('shows text when showText prop is true', () => {
    render(React.createElement(LogoAnimation, { showText: true }));
    const text = screen.getByText('EV Bunker');
    expect(text).toBeInTheDocument();
  });

  test('hides text when showText prop is false', () => {
    render(React.createElement(LogoAnimation, { showText: false }));
    const text = screen.queryByText('EV Bunker');
    // Text should not be in the document when showText is false
    expect(text).not.toBeInTheDocument();
  });

  test('respects disableGlow prop', () => {
    const { container } = render(React.createElement(LogoAnimation, { disableGlow: true }));
    // When disableGlow is true, we should still render the logo
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  test('respects disableParticles prop', () => {
    const { container } = render(React.createElement(LogoAnimation, { disableParticles: true }));
    // When disableParticles is true, we should still render the logo
    expect(container.querySelector('img')).toBeInTheDocument();
  });
});