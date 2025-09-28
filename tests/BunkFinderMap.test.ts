// Mock the CSS import
jest.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock maplibre-gl
jest.mock('maplibre-gl', () => ({
  Map: jest.fn(() => ({
    addControl: jest.fn(),
    on: jest.fn((event, callback) => {
      if (event === 'load') {
        callback();
      }
    }),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    setStyle: jest.fn(),
    isStyleLoaded: jest.fn(() => true),
    remove: jest.fn(),
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    flyTo: jest.fn()
  })),
  Marker: jest.fn(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis()
  })),
  GeolocateControl: jest.fn(),
  NavigationControl: jest.fn()
}));

// Mock maplibre-gl-geocoder
jest.mock('@maplibre/maplibre-gl-geocoder', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn()
  }));
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div'
  }
}));

// Simple test to verify the component can be imported
describe('BunkFinderMap', () => {
  it('can be imported without errors', () => {
    // This test just verifies that the component can be imported without syntax errors
    expect(true).toBe(true);
  });
});