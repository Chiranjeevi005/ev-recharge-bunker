/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../../src/app/login/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

// Mock the auth library
jest.mock('../../src/lib/auth', () => ({
  signIn: jest.fn(),
}));

describe('Login Page', () => {
  it('should render login tabs', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByText('Client Login')).toBeInTheDocument();
  });

  it('should display admin login form by default', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should switch to client login when tab is clicked', () => {
    render(<LoginPage />);
    
    const clientTab = screen.getByText('Client Login');
    fireEvent.click(clientTab);
    
    expect(screen.getByText('Sign in with your Google account to access client features')).toBeInTheDocument();
  });

  it('should display admin credentials information', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('admin@ebunker.com')).toBeInTheDocument();
    expect(screen.getByText('admin123')).toBeInTheDocument();
  });
});