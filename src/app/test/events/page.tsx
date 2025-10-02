"use client";

import React, { useState, useEffect } from 'react';

export default function EventTestPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [location, setLocation] = useState('Delhi');

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage event received:', e);
      setEvents(prev => [...prev, { type: 'storage', event: e, timestamp: new Date().toISOString() }]);
    };

    const handleLocationUpdate = (e: CustomEvent) => {
      console.log('Custom location event received:', e);
      setEvents(prev => [...prev, { type: 'custom', event: e, timestamp: new Date().toISOString() }]);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('locationUpdated', handleLocationUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('locationUpdated', handleLocationUpdate as EventListener);
    };
  }, []);

  const dispatchStorageEvent = () => {
    const event = new StorageEvent('storage', {
      key: 'userProfile',
      newValue: JSON.stringify({ location })
    });
    window.dispatchEvent(event);
  };

  const dispatchCustomEvent = () => {
    const event = new CustomEvent('locationUpdated', {
      detail: { location }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Event Test Page</h1>
      
      <div className="mb-6">
        <label className="block mb-2">Location:</label>
        <select 
          value={location} 
          onChange={(e) => setLocation(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded"
        >
          <option value="Delhi">Delhi</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Chennai">Chennai</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Kolkata">Kolkata</option>
          <option value="Pune">Pune</option>
          <option value="Ahmedabad">Ahmedabad</option>
        </select>
      </div>
      
      <div className="mb-6 space-x-4">
        <button 
          onClick={dispatchStorageEvent}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Dispatch Storage Event
        </button>
        <button 
          onClick={dispatchCustomEvent}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Dispatch Custom Event
        </button>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Received Events:</h2>
        <div className="bg-gray-800 p-4 rounded">
          {events.length === 0 ? (
            <p>No events received yet</p>
          ) : (
            <ul className="space-y-2">
              {events.map((event, index) => (
                <li key={index} className="border-b border-gray-700 pb-2">
                  <p><strong>Type:</strong> {event.type}</p>
                  <p><strong>Timestamp:</strong> {event.timestamp}</p>
                  <p><strong>Detail:</strong> {JSON.stringify(event.event.detail || event.event.newValue)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}