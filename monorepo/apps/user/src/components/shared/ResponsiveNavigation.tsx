import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveWrapper } from './ResponsiveWrapper';
import { useResponsive } from '../../hooks/use-responsive';
import { Home, Search, User, Ticket, Bell } from 'lucide-react';

export function ResponsiveNavigation() {
  return (
    <ResponsiveWrapper
      mobile={<MobileNavigation />}
      desktop={<DesktopNavigation />}
    />
  );
}

function MobileNavigation() {
  const navigate = useNavigate();
  const { screenWidth } = useResponsive();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2 px-4">
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button
          onClick={() => navigate('/search')}
          className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-xs mt-1">Search</span>
        </button>
        
        <button
          onClick={() => navigate('/my-bookings')}
          className="flex flex-col items-center p-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <Ticket className="w-5 h-5" />
          <span className="text-xs mt-1">Bookings</span>
        </button>
        
        <button
          onClick={() => navigate('/notifications')}
          className="flex flex-col items-center p-2 text-gray-600 hover:text-purple-600 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="text-xs mt-1">Alerts</span>
          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        </button>
        
        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
}

function DesktopNavigation() {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="font-extrabold text-2xl text-purple-700 tracking-wide hover:text-purple-800 transition-colors"
            >
              Tiyende
            </button>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/search')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Search Routes
            </button>
            
            <button
              onClick={() => navigate('/my-bookings')}
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              My Bookings
            </button>
            
            <button
              onClick={() => navigate('/notifications')}
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium relative"
            >
              Notifications
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/profile')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 