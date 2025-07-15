import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from './components/Home';
import { SearchResults } from './components/SearchResults';
import { SeatSelection } from './components/SeatSelection';
import { Checkout } from './components/Checkout';
import { BookingConfirmation } from './components/BookingConfirmation';
import './index.css';
import { ProgressIndicator } from './components/shared/ProgressIndicator';
import LoginPage from './pages/login';
import ETicketPage from './components/ETicketPage';
import TicketList from './components/TicketList';
import Profile from './pages/profile';
import Support from './pages/support';
import EditProfile from './pages/EditProfile';
import Bookings from './pages/Bookings';
import NotificationsPage from './pages/notifications';
import SignupPage from './pages/signup';
import ResponsiveDemo from './pages/ResponsiveDemo';
import { FaBus, FaCheckSquare, FaCog, FaInfoCircle } from 'react-icons/fa';
import { Bell } from 'lucide-react';
import { useIsDesktop } from './hooks/use-responsive';
// Create a client
const queryClient = new QueryClient();
// Temporary placeholder components
const SearchRoutes = () => (_jsxs("div", { className: "p-4", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Search Routes" }), _jsx("p", { children: "Route search coming soon..." })] }));
function RequireAuth({ children }) {
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
        return _jsx(Home, {});
    }
    // --- END NEW ---
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 pb-20 sm:pb-0", children: [showHeader && (_jsxs("div", { className: "fixed top-0 left-0 right-0 z-50 px-0 sm:px-0", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2 bg-white shadow-md border-b border-gray-100", children: [_jsx("button", { onClick: () => navigate('/'), className: "focus:outline-none", children: _jsx("img", { src: "/images/logo.png", alt: "Tiyende Logo", className: "h-10 w-auto object-contain" }) }), _jsx("button", { className: "p-2 rounded-full bg-white shadow-md hover:bg-blue-50 transition flex items-center justify-center", onClick: () => navigate('/notifications'), "aria-label": "Notifications", children: _jsx(Bell, { size: 24, color: "#2563eb", style: { filter: 'drop-shadow(0 2px 4px rgba(37,99,235,0.15))' } }) })] }), showStepper && _jsx(ProgressIndicator, {})] })), _jsx("main", { className: `${mainPaddingTop} px-2 sm:px-0`, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignupPage, {}) }), _jsx(Route, { path: "/", element: _jsx(RequireAuth, { children: _jsx(Home, {}) }) }), _jsx(Route, { path: "/search", element: _jsx(RequireAuth, { children: _jsx(SearchResults, {}) }) }), _jsx(Route, { path: "/select-seats/:busId", element: _jsx(RequireAuth, { children: _jsx(SeatSelection, {}) }) }), _jsx(Route, { path: "/checkout", element: _jsx(RequireAuth, { children: _jsx(Checkout, {}) }) }), _jsx(Route, { path: "/booking-confirmation", element: _jsx(RequireAuth, { children: _jsx(BookingConfirmation, {}) }) }), _jsx(Route, { path: "/my-bookings", element: _jsx(RequireAuth, { children: _jsx(TicketList, {}) }) }), _jsx(Route, { path: "/my-bookings/:bookingReference", element: _jsx(RequireAuth, { children: _jsx(ETicketPage, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(RequireAuth, { children: _jsx(Profile, {}) }) }), _jsx(Route, { path: "/profile/edit", element: _jsx(RequireAuth, { children: _jsx(EditProfile, {}) }) }), _jsx(Route, { path: "/profile/bookings", element: _jsx(RequireAuth, { children: _jsx(Bookings, {}) }) }), _jsx(Route, { path: "/profile/notifications", element: _jsx(RequireAuth, { children: _jsx(NotificationsPage, {}) }) }), _jsx(Route, { path: "/notifications", element: _jsx(RequireAuth, { children: _jsx(NotificationsPage, {}) }) }), _jsx(Route, { path: "/support", element: _jsx(RequireAuth, { children: _jsx(Support, {}) }) }), _jsx(Route, { path: "/responsive-demo", element: _jsx(RequireAuth, { children: _jsx(ResponsiveDemo, {}) }) })] }) }), !hideBottomNav && (_jsxs("nav", { className: "fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 flex justify-around py-3 sm:hidden z-50", children: [_jsxs("button", { className: "flex flex-col items-center text-blue-600 font-semibold focus:outline-none", onClick: () => navigate('/'), children: [_jsx("span", { className: "mb-1", children: _jsx(FaBus, { size: 24, color: "#2563eb" }) }), _jsx("span", { className: "text-xs", children: "Book" })] }), _jsxs("button", { className: "flex flex-col items-center text-green-600 font-semibold focus:outline-none", onClick: () => navigate('/my-bookings'), children: [_jsx("span", { className: "mb-1", children: _jsx(FaCheckSquare, { size: 24, color: "#16a34a" }) }), _jsx("span", { className: "text-xs", children: "Bookings" })] }), _jsxs("button", { className: "flex flex-col items-center text-gray-600 font-semibold focus:outline-none", onClick: () => navigate('/support'), children: [_jsx("span", { className: "mb-1", children: _jsx(FaInfoCircle, { size: 24, color: "#4b5563" }) }), _jsx("span", { className: "text-xs", children: "Info" })] }), _jsxs("button", { className: "flex flex-col items-center text-purple-600 font-semibold focus:outline-none", onClick: () => navigate('/profile'), children: [_jsx("span", { className: "mb-1", children: _jsx(FaCog, { size: 24, color: "#7c3aed" }) }), _jsx("span", { className: "text-xs", children: "Manage" })] })] }))] }));
}
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(BrowserRouter, { children: _jsx(AppContent, {}) }) }) }));
