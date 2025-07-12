import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Home } from './components/Home'
import { SearchResults } from './components/SearchResults'
import { SeatSelection } from './components/SeatSelection'
import { Checkout } from './components/Checkout'
import { BookingConfirmation } from './components/BookingConfirmation'
import './index.css'
import { ProgressIndicator } from './components/shared/ProgressIndicator'
import { tickets, user as userApi } from './lib/api'
import LoginPage from './pages/login'
import ETicketPage from './components/ETicketPage'
import ReviewModal from './components/ReviewModal'
import TicketList from './components/TicketList'
import Profile from './pages/profile'
import Support from './pages/support'
import EditProfile from './pages/EditProfile'
import Bookings from './pages/Bookings'
import NotificationsPage from './pages/notifications'
import SignupPage from './pages/signup';
import ResponsiveDemo from './pages/ResponsiveDemo';
import { FaBus, FaCheckSquare, FaCog, FaInfoCircle } from 'react-icons/fa';
import { Bell } from 'lucide-react';
import { useResponsive, useIsDesktop } from './hooks/use-responsive';

// Create a client
const queryClient = new QueryClient()

// Temporary placeholder components
const SearchRoutes = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-4">Search Routes</h2>
    <p>Route search coming soon...</p>
  </div>
)

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  const location = window.location;
  if (!token) {
    window.location.href = '/login';
    return null;
  }
  return children;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  console.log('DEBUG:', { isDesktop, path: location.pathname });
  const hideBottomNav = location.pathname === '/login' || location.pathname === '/signup';
  // Show header (Tiyende + bell) on all except login/signup
  const showHeader = location.pathname !== '/login' && location.pathname !== '/signup';
  // Show stepper only on booking-related pages
  const showStepper = [
    '/',
    '/search',
    '/select-seats',
    '/checkout',
    '/booking-confirmation'
  ].some(path => location.pathname === path || location.pathname.startsWith('/select-seats')) && location.pathname !== '/';

  // Padding: 60px for header only, 120px for header+stepper
  const mainPaddingTop = showHeader ? (showStepper ? 'pt-[120px] sm:pt-[120px]' : 'pt-[60px] sm:pt-[60px]') : '';

  // --- NEW: Only render Home on desktop homepage ---
  if (isDesktop && location.pathname === '/') {
    return <Home />;
  }
  // --- END NEW ---

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
      {showHeader && (
        <div className="fixed top-0 left-0 right-0 z-50 px-0 sm:px-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-white shadow-md border-b border-gray-100">
            <img src="/images/logo.png" alt="Tiyende Logo" className="h-10 w-auto object-contain" />
            <button className="p-2 rounded-full bg-white shadow-md hover:bg-blue-50 transition flex items-center justify-center" onClick={() => navigate('/notifications')} aria-label="Notifications">
              <Bell size={24} color="#2563eb" style={{ filter: 'drop-shadow(0 2px 4px rgba(37,99,235,0.15))' }} />
            </button>
          </div>
          {/* Stepper: only on booking pages */}
          {showStepper && <ProgressIndicator />}
        </div>
      )}
      <main className={`${mainPaddingTop} px-2 sm:px-0`}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/search" element={<RequireAuth><SearchResults /></RequireAuth>} />
          <Route path="/select-seats/:busId" element={<RequireAuth><SeatSelection /></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/booking-confirmation" element={<RequireAuth><BookingConfirmation /></RequireAuth>} />
          <Route path="/my-bookings" element={<RequireAuth><TicketList /></RequireAuth>} />
          <Route path="/my-bookings/:bookingReference" element={<RequireAuth><ETicketPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/profile/edit" element={<RequireAuth><EditProfile /></RequireAuth>} />
          <Route path="/profile/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
          <Route path="/profile/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
          <Route path="/support" element={<RequireAuth><Support /></RequireAuth>} />
          <Route path="/responsive-demo" element={<RequireAuth><ResponsiveDemo /></RequireAuth>} />
        </Routes>
      </main>
      {/* Global Bottom Navigation - mobile only */}
      {!hideBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 flex justify-around py-3 sm:hidden z-50">
          <button className="flex flex-col items-center text-blue-600 font-semibold focus:outline-none" onClick={() => navigate('/')}> 
            <span className="mb-1"><FaBus size={24} color="#2563eb" /></span>
            <span className="text-xs">Book</span>
          </button>
          <button className="flex flex-col items-center text-green-600 font-semibold focus:outline-none" onClick={() => navigate('/my-bookings')}> 
            <span className="mb-1"><FaCheckSquare size={24} color="#16a34a" /></span>
            <span className="text-xs">Bookings</span>
          </button>
          <button className="flex flex-col items-center text-gray-600 font-semibold focus:outline-none" onClick={() => navigate('/support')}> 
            <span className="mb-1"><FaInfoCircle size={24} color="#4b5563" /></span>
            <span className="text-xs">Info</span>
          </button>
          <button className="flex flex-col items-center text-purple-600 font-semibold focus:outline-none" onClick={() => navigate('/profile/edit')}> 
            <span className="mb-1"><FaCog size={24} color="#7c3aed" /></span>
            <span className="text-xs">Manage</span>
          </button>
        </nav>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
) 