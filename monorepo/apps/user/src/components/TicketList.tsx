import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, CalendarDays, AlertCircle, RefreshCw, Ticket as TicketIcon, MapPin, Clock, User2 } from 'lucide-react';
import { tickets as ticketsApi } from '../lib/api';
import type { Ticket } from '../types/schema';

interface TicketWithRoute extends Ticket {
  departure?: string;
  destination?: string;
  route?: {
    departure: string;
    destination: string;
    departureTime: string;
  };
}

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<TicketWithRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage for debugging
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        return {};
      }
    })();
    setUserInfo(user);
    
    fetchTickets();
    
    // Auto-refresh every 30 seconds to catch new bookings
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      console.log('Fetching tickets...');
      console.log('User info from localStorage:', userInfo);
      
      const token = localStorage.getItem('token');
      console.log('Token present:', !!token);
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await ticketsApi.getByUser();
      console.log('Tickets response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setTickets(response.data);
        if (showRefreshing && response.data.length > 0) {
          // Show a brief success message if new tickets were found
          const newTickets = response.data.filter(ticket => 
            new Date(ticket.bookingDate).getTime() > Date.now() - 60000 // Tickets created in last minute
          );
          if (newTickets.length > 0) {
            console.log('Found new tickets:', newTickets.length);
          }
        }
      } else {
        console.error('Invalid tickets response:', response.data);
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError(err?.response?.data?.error || 'Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading your bookings...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">Error Loading Bookings</h2>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            
            {/* Debug Information */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Debug Information:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>User ID: {userInfo?.id || 'Not found'}</p>
                <p>User Mobile: {userInfo?.mobile || 'Not found'}</p>
                <p>User Email: {userInfo?.email || 'Not found'}</p>
                <p>Token Present: {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => fetchTickets(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Re-login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-white py-0 pb-20 sm:pb-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-blue-100 shadow-sm px-2 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <TicketIcon className="h-7 w-7 sm:h-9 sm:w-9 text-blue-600" />
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">My Bookings</h1>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2" />
            <p className="text-sm sm:text-lg text-gray-600 mt-1">View and manage your bus ticket bookings</p>
          </div>
        </div>
        <button
          onClick={() => fetchTickets(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline font-semibold">Refresh</span>
        </button>
      </div>

      <div className="max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
        {tickets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-16 text-center flex flex-col items-center justify-center mt-16">
            <Plane className="h-16 w-16 text-blue-200 mb-4" />
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-base text-gray-600 mb-6">
              You haven't made any bookings yet. Start by searching for available routes.
            </p>
            <button
              onClick={() => navigate('/')} 
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold shadow hover:from-blue-700 hover:to-purple-700 transition-colors text-lg"
            >
              Search Routes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {tickets.map((ticket, idx) => {
              // Status badge color
              let statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-300';
              if (ticket.status === 'paid') statusColor = 'bg-green-100 text-green-800 border-green-300';
              if (ticket.status === 'cancelled' || ticket.status === 'refunded') statusColor = 'bg-red-100 text-red-800 border-red-300';
              return (
                <div
                  key={ticket.id || idx}
                  className="relative bg-white rounded-2xl shadow-lg border-l-8 border-blue-500 flex flex-col gap-2 p-3 min-h-[120px] hover:shadow-2xl transition-shadow sm:gap-4 sm:p-6 sm:min-h-[220px]"
                >
                  {/* Route & Date Header */}
                  <div className="mb-1 w-full sm:mb-2">
                    <span className="font-bold text-base text-blue-700 block sm:text-lg">
                      {ticket.departure || ticket.route?.departure} <span className="mx-1">→</span> {ticket.destination || ticket.route?.destination}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 text-sm whitespace-nowrap mt-0.5 sm:text-base sm:mt-1">
                      <CalendarDays className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
                      <span className="font-semibold">{ticket.travelDate ? new Date(ticket.travelDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                    </span>
                  </div>
                  {/* Details Row */}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-700 mb-1 sm:gap-4 sm:text-sm sm:mb-2">
                    <div className="flex items-center gap-1"><User2 className="h-3 w-3 text-blue-500 sm:h-4 sm:w-4" /> Seat: <span className="font-semibold">{ticket.seatNumber}</span></div>
                    <div className="flex items-center gap-1 text-green-700"><span className="font-semibold">Amount:</span> <span className="font-bold">K {ticket.amount}</span></div>
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-purple-500 sm:h-4 sm:w-4" /> {ticket.route?.departureTime ? formatTime(ticket.route.departureTime) : ''}</div>
                  </div>
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mt-1 sm:mt-2">
                    <span className={`border ${statusColor} rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:px-3 sm:py-1 sm:text-xs`}>{ticket.status || 'PENDING'}</span>
                  </div>
                  {/* View E-ticket Button */}
                  <button
                    onClick={() => navigate(`/my-bookings/${ticket.bookingReference}`)}
                    className="w-full mt-auto py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold shadow hover:from-blue-700 hover:to-purple-700 transition-colors text-sm sm:py-2 sm:text-base"
                  >
                    View E-ticket
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList; 