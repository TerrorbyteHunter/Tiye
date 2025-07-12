import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  totalCustomers: number;
  activeRoutes: number;
  averageRevenuePerBooking: number;
  bookingSuccessRate: number;
  topRoutes: Array<{
    departure: string;
    destination: string;
    bookings: number;
    revenue: number;
    capacity: number;
    occupancy_rate: number;
  }>;
  revenueTrend: Array<{
    date: string;
    daily_revenue: number;
    daily_bookings: number;
  }>;
  previousPeriod: {
    revenue: number;
    bookings: number;
  } | null;
}

const fetchAnalytics = async (startDate: string, endDate: string): Promise<AnalyticsData> => {
  const { data } = await api.get('/vendor/analytics', {
    params: { startDate, endDate }
  });
  return data;
};

export default function Reports() {
  // Date range state - default to all time (no date filter)
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics', startDate, endDate],
    queryFn: () => fetchAnalytics(startDate, endDate),
  });

  const handleDateChange = () => {
    refetch();
  };

  const handleTodayClick = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const handleQuickPeriod = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    if (!data) return;
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Revenue', `ZMW ${(data.totalRevenue || 0).toLocaleString()}`],
      ['Total Bookings', (data.totalBookings || 0).toString()],
      ['Active Routes', (data.activeRoutes || 0).toString()],
      ['Average Revenue per Booking', `ZMW ${(data.averageRevenuePerBooking || 0).toFixed(2)}`],
      ['', ''],
      ['Top Routes', ''],
      ['Route', 'Bookings', 'Revenue', 'Occupancy Rate'],
      ...(data.topRoutes || []).map(route => [
        `${route.departure} → ${route.destination}`,
        (route.bookings || 0).toString(),
        `ZMW ${(route.revenue || 0).toLocaleString()}`,
        `${Number(route.occupancy_rate || 0).toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${startDate || 'all-time'}-to-${endDate || 'all-time'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-2 text-lg">All-time business insights and performance metrics</p>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={handleExport}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                📊 Export CSV
              </button>
              <Link
                to="/sales"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                📈 Go to Sales
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Period Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              ⏰ All Time
            </button>
            <button
              onClick={() => handleQuickPeriod(7)}
              className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              📅 Last 7 Days
            </button>
            <button
              onClick={() => handleQuickPeriod(30)}
              className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              📅 Last 30 Days
            </button>
            <button
              onClick={() => handleQuickPeriod(90)}
              className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              📅 Last 90 Days
            </button>
            <button
              onClick={handleTodayClick}
              className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl hover:from-green-500 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              🎯 Today
            </button>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value);
                  handleDateChange();
                }}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Start date"
              />
            </div>
            <div className="text-gray-500 text-xl">→</div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => {
                  setEndDate(e.target.value);
                  handleDateChange();
                }}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="End date"
              />
            </div>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading analytics...</p>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-lg">Failed to load analytics.</p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl mb-2">💰</div>
                    <p className="text-green-100 mb-1 font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold">ZMW {(data.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                  {data.previousPeriod && (
                    <div className={`text-sm px-3 py-1 rounded-full ${calculateChange(data.totalRevenue || 0, data.previousPeriod.revenue || 0) >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {calculateChange(data.totalRevenue || 0, data.previousPeriod.revenue || 0) >= 0 ? '↗' : '↘'} 
                      {Math.abs(calculateChange(data.totalRevenue || 0, data.previousPeriod.revenue || 0)).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl mb-2">🎫</div>
                    <p className="text-blue-100 mb-1 font-medium">Total Bookings</p>
                    <p className="text-3xl font-bold">{data.totalBookings || 0}</p>
                  </div>
                  {data.previousPeriod && (
                    <div className={`text-sm px-3 py-1 rounded-full ${calculateChange(data.totalBookings || 0, data.previousPeriod.bookings || 0) >= 0 ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'}`}>
                      {calculateChange(data.totalBookings || 0, data.previousPeriod.bookings || 0) >= 0 ? '↗' : '↘'} 
                      {Math.abs(calculateChange(data.totalBookings || 0, data.previousPeriod.bookings || 0)).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                <div>
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-purple-100 mb-1 font-medium">Avg Revenue/Booking</p>
                  <p className="text-3xl font-bold">ZMW {(data.averageRevenuePerBooking || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🚌</div>
                  <p className="text-gray-600 mb-1 font-medium">Active Routes</p>
                  <p className="text-4xl font-bold text-purple-600">{data.activeRoutes || 0}</p>
                  <p className="text-sm text-gray-500">currently active</p>
                </div>
              </div>
            </div>

            {/* Top Performing Routes */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-3">🏆</div>
                <h3 className="text-2xl font-bold text-gray-800">Top Performing Routes</h3>
              </div>
              {data.topRoutes && data.topRoutes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-4 font-semibold text-gray-700">Route</th>
                        <th className="text-right py-4 font-semibold text-gray-700">Bookings</th>
                        <th className="text-right py-4 font-semibold text-gray-700">Revenue</th>
                        <th className="text-right py-4 font-semibold text-gray-700">Occupancy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topRoutes.map((route, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 font-medium text-gray-800">{route.departure} → {route.destination}</td>
                          <td className="text-right py-4 text-blue-600 font-semibold">{route.bookings || 0}</td>
                          <td className="text-right py-4 text-green-600 font-semibold">ZMW {(route.revenue || 0).toLocaleString()}</td>
                          <td className="text-right py-4">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                              {Number(route.occupancy_rate || 0).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500 text-lg">No route data available for this period</p>
                </div>
              )}
            </div>

            {/* Revenue Trend */}
            {data.revenueTrend && data.revenueTrend.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="text-3xl mr-3">📈</div>
                  <h3 className="text-2xl font-bold text-gray-800">Revenue Trend</h3>
                </div>
                <div className="space-y-3">
                  {data.revenueTrend.map((day, index) => (
                    <div key={index} className="flex justify-between items-center py-4 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <span className="text-sm text-gray-600 font-medium">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                      <div className="flex gap-6">
                        <span className="text-sm text-green-600 font-semibold">
                          ZMW {(day.daily_revenue || 0).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {day.daily_bookings || 0} bookings
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
} 