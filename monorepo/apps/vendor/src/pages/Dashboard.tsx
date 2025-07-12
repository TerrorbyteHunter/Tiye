import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { routes } from '../lib/api';
import { Clock, Users, DollarSign, Star, BarChart2, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/ui/loading-spinner';

interface DashboardStats {
  totalRoutes: number;
  totalBookings: number;
  totalRevenue: number;
  activeRoutes: number;
}

interface RecentBooking {
  id: number;
  passenger_name: string;
  departure: string;
  destination: string;
  seat_number: number;
  fare: number;
  created_at: string;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => routes.getDashboardStats(),
    retry: 2,
  });

  const { data: recentBookings = [], isLoading: bookingsLoading, error: bookingsError } = useQuery<RecentBooking[]>({
    queryKey: ['recent-bookings'],
    queryFn: () => routes.getRecentBookings(),
    retry: 2,
  });

  const { 
    data: upcomingTrips = [], 
    isLoading: tripsLoading, 
    error: tripsError 
  } = useQuery({
    queryKey: ['upcoming-trips'],
    queryFn: async () => {
      try {
        const data = await routes.getUpcomingTrips();
        console.log('Upcoming trips from API:', data);
        return data;
      } catch (error) {
        console.error('Failed to fetch upcoming trips:', error);
        return []; // Return empty array on error
      }
    },
    retry: 1, // Only retry once for this endpoint
    retryDelay: 1000,
  });

  // Show loading state only for critical data (stats and bookings)
  if (statsLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading dashboard data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <h1 className="text-3xl font-bold gradient-text flex items-center gap-2 mb-2">
        <BarChart2 className="h-7 w-7 text-indigo-500" /> Dashboard
      </h1>
      <p className="text-muted-foreground mb-8">Here's what's happening with your transport business today.</p>

      {/* Error Alert for Stats */}
      {statsError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>Unable to load dashboard statistics. Please refresh the page.</span>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/80">Revenue (K)</p>
              <p className="text-2xl font-bold">K{(stats?.totalRevenue || 0).toLocaleString()}</p>
              <p className="text-sm text-white/80">↑ 1.8% vs last month</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/80">Active Routes</p>
              <p className="text-2xl font-bold">{stats?.activeRoutes || 0}</p>
              <p className="text-sm text-white/80">On schedule</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-xl shadow-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/80">Total Bookings</p>
              <p className="text-2xl font-bold">{stats?.totalBookings || 0}</p>
              <p className="text-sm text-white/80">↑ 2.3% vs yesterday</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white rounded-xl shadow-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/80">Total Routes</p>
              <p className="text-2xl font-bold">{stats?.totalRoutes || 0}</p>
              <p className="text-sm text-white/80">All routes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings and Upcoming Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass bg-white/80 rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" /> Recent Bookings
            </h2>
            <a href="/tickets" className="text-sm text-indigo-600 hover:text-indigo-800">View all</a>
          </div>
          
          {bookingsError ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Unable to load recent bookings</p>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No recent bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex justify-between items-center p-4 bg-indigo-50/60 rounded-lg">
                  <div>
                    <p className="font-medium text-indigo-900">{booking.passenger_name}</p>
                    <p className="text-sm text-indigo-700">{booking.departure} → {booking.destination}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Seat {booking.seat_number}</p>
                    <p className="text-sm text-indigo-500">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass bg-white/80 rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" /> Upcoming Trips
            </h2>
            <a href="/schedule" className="text-sm text-indigo-600 hover:text-indigo-800">View all</a>
          </div>
          
          {tripsLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="md" text="Loading upcoming trips..." />
            </div>
          ) : tripsError ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Unable to load upcoming trips</p>
              <p className="text-sm mt-1">This feature is temporarily unavailable</p>
            </div>
          ) : upcomingTrips.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No more trips for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingTrips.map((trip: any) => (
                <div key={trip.id} className="p-4 bg-indigo-50/60 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-indigo-900">{trip.departure} → {trip.destination}</p>
                      <p className="text-sm text-indigo-700">
                        Today at {trip.departuretime.slice(0,5)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-indigo-700">
                        {trip.booked_seats}/{trip.capacity} seats
                      </p>
                      <p className="text-sm text-indigo-500">
                        {((trip.booked_seats / trip.capacity) * 100).toFixed(0)}% booked
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 