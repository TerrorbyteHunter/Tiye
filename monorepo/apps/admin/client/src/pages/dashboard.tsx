import { useQuery } from '@tanstack/react-query';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RecentBookings } from '@/components/dashboard/recent-bookings';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { PerformanceCharts } from '@/components/dashboard/performance-charts';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { DashboardStats } from '@/types';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: dashboardData, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard'],
  });

  const handleGenerateReport = () => {
    // In a real implementation, this would generate and download a report
    alert('Report generation would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl mb-8 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard Overview</h1>
              <p className="text-blue-100">Welcome back! Here's what's happening with Tiyende today.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden md:block w-1 h-12 bg-white/30 rounded-full"></div>
              <div>
                <p className="text-sm text-blue-200">Today's Summary</p>
                <p className="text-2xl font-bold">
                  {dashboardData?.totalBookings || 0} bookings • K{dashboardData?.totalRevenue?.toLocaleString() || 0} revenue
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-blue-200" />
                </div>
              </div>
              <Button 
                onClick={handleGenerateReport} 
                className="flex items-center bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <Download className="h-5 w-5 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <OverviewCards 
          stats={{
            totalBookings: dashboardData?.totalBookings || 0,
            totalRevenue: dashboardData?.totalRevenue || 0,
            activeVendors: dashboardData?.activeVendors || 0,
            activeRoutes: dashboardData?.activeRoutes || 0,
            bookingChange: dashboardData?.bookingChange,
            revenueChange: dashboardData?.revenueChange,
            vendorChange: dashboardData?.vendorChange,
            routeChange: dashboardData?.routeChange,
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Bookings and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentBookings 
            bookings={dashboardData?.recentBookings || []}
            isLoading={isLoading}
          />
        </div>
        <div>
          <RecentActivities 
            activities={dashboardData?.recentActivities || []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Performance Charts */}
      <PerformanceCharts 
        isLoading={isLoading} 
        chartData={{
          revenueData: dashboardData?.revenueData || [],
          bookingDistribution: dashboardData?.bookingDistribution || [],
          revenueDistribution: dashboardData?.revenueDistribution || [],
          bookingsData: dashboardData?.bookingsData || [],
        }}
      />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}