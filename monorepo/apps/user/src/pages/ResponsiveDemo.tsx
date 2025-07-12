import React from 'react';
import { ResponsiveLayout } from '../components/shared/ResponsiveLayout';
import { ResponsiveDataDisplay } from '../components/shared/ResponsiveDataDisplay';
import { ResponsiveWrapper, MobileOnly, DesktopOnly } from '../components/shared/ResponsiveWrapper';
import { useResponsive } from '../hooks/use-responsive';

// Sample data for demonstration
const sampleData = [
  {
    id: '1',
    title: 'Lusaka to Livingstone',
    description: 'Express bus service with AC',
    status: 'active',
    date: '2024-01-15',
    price: 'K250'
  },
  {
    id: '2',
    title: 'Kitwe to Ndola',
    description: 'Regular service with stops',
    status: 'pending',
    date: '2024-01-16',
    price: 'K180'
  },
  {
    id: '3',
    title: 'Chingola to Solwezi',
    description: 'Premium service with WiFi',
    status: 'active',
    date: '2024-01-17',
    price: 'K320'
  },
  {
    id: '4',
    title: 'Kabwe to Chipata',
    description: 'Standard service',
    status: 'cancelled',
    date: '2024-01-18',
    price: 'K200'
  }
];

export default function ResponsiveDemo() {
  const { isMobile, isTablet, isDesktop, screenWidth, screenHeight, orientation } = useResponsive();

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Responsive Design Demo
          </h1>
          <p className="text-gray-600">
            This page demonstrates different responsive patterns and components.
          </p>
        </div>

        {/* Device Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Device Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-900">Screen Size</h3>
              <p className="text-sm text-gray-600">{screenWidth} × {screenHeight}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-900">Device Type</h3>
              <p className="text-sm text-gray-600">
                {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-900">Orientation</h3>
              <p className="text-sm text-gray-600 capitalize">{orientation}</p>
            </div>
          </div>
        </div>

        {/* Conditional Content Examples */}
        <div className="space-y-8">
          {/* Mobile Only Content */}
          <MobileOnly>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Mobile Only Content</h3>
              <p className="text-blue-700 text-sm">
                This content only appears on mobile devices. Perfect for mobile-specific features like swipe gestures or touch-optimized interfaces.
              </p>
            </div>
          </MobileOnly>

          {/* Desktop Only Content */}
          <DesktopOnly>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Desktop Only Content</h3>
              <p className="text-green-700 text-sm">
                This content only appears on desktop devices. Great for complex interfaces that need more screen real estate.
              </p>
            </div>
          </DesktopOnly>

          {/* Responsive Data Display */}
          <div>
            <ResponsiveDataDisplay 
              data={sampleData}
              title="Route Information"
              onItemClick={(item) => console.log('Clicked:', item)}
            />
          </div>

          {/* Responsive Grid Layout */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Responsive Grid Layout</h2>
            <ResponsiveWrapper
              mobile={
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                      <h3 className="font-semibold">Card {i}</h3>
                      <p className="text-gray-600 text-sm">Mobile layout - single column</p>
                    </div>
                  ))}
                </div>
              }
              desktop={
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                      <h3 className="font-semibold">Card {i}</h3>
                      <p className="text-gray-600 text-sm">Desktop layout - multi-column grid</p>
                    </div>
                  ))}
                </div>
              }
            />
          </div>

          {/* Responsive Form Example */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Responsive Form</h2>
            <ResponsiveWrapper
              mobile={
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Submit
                  </button>
                </form>
              }
              desktop={
                <form className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="col-span-2">
                    <button 
                      type="submit"
                      className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              }
            />
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
} 