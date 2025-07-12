import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Download, Calendar as CalendarIcon, TrendingUp, Users, Star, MapPin, BarChart3, PieChart } from "lucide-react";
import {
  RevenueTimeChart,
  RevenueDistributionChart,
  BookingsTimeChart,
  BookingsDistributionChart,
} from "@/components/analytics/charts";
import { API } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

export default function Analytics() {
  const { toast } = useToast();
  const [period, setPeriod] = React.useState("30");
  const [selectedFrom, setSelectedFrom] = React.useState<string>("");
  const [selectedTo, setSelectedTo] = React.useState<string>("");

  // Build query params
  const queryParams = selectedFrom && selectedTo
    ? `startDate=${selectedFrom}&endDate=${selectedTo}`
    : `period=${period}`;

  // Fetch analytics data
  const { data: revenueData, isLoading: isRevenueLoading, error: revenueError } = useQuery({
    queryKey: ['analytics', 'revenue', queryParams],
    queryFn: async () => {
      return await apiRequest(`${API.dashboardStats}/revenue?${queryParams}`) as any[];
    },
  });

  const { data: vendorData, isLoading: isVendorLoading, error: vendorError } = useQuery({
    queryKey: ['analytics', 'vendors', queryParams],
    queryFn: async () => {
      return await apiRequest(`${API.dashboardStats}/vendors?${queryParams}`) as any[];
    },
  });

  const { data: bookingsData, isLoading: isBookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['analytics', 'bookings', queryParams],
    queryFn: async () => {
      return await apiRequest(`${API.dashboardStats}/bookings?${queryParams}`) as any[];
    },
  });

  const { data: routeData, isLoading: isRouteLoading, error: routeError } = useQuery({
    queryKey: ['analytics', 'routes', queryParams],
    queryFn: async () => {
      return await apiRequest(`${API.dashboardStats}/routes?${queryParams}`) as any[];
    },
  });

  const isLoading = isRevenueLoading || isVendorLoading || isBookingsLoading || isRouteLoading;
  const isError = revenueError || vendorError || bookingsError || routeError;

  // KPI calculations
  const totalRevenue = revenueData?.reduce((sum, r) => sum + (r.revenue || 0), 0) || 0;
  const totalBookings = bookingsData?.reduce((sum, b) => sum + (b.bookings || 0), 0) || 0;
  const topVendor = vendorData && vendorData.length > 0 ? vendorData[0].name : "-";
  const topRoute = routeData && routeData.length > 0 ? routeData[0].name : "-";

  const handleExport = async () => {
    try {
      const response = await fetch(`${API.exportData}?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to export data');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export analytics data',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl mb-8 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-purple-100">Comprehensive insights into your business performance</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="hidden md:block w-1 h-12 bg-white/30 rounded-full"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">ZMW {totalRevenue.toLocaleString()}</div>
                  <div className="text-xs text-purple-200">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalBookings.toLocaleString()}</div>
                  <div className="text-xs text-purple-200">Total Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-xs text-purple-200">Active Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-xs text-purple-200">Active Routes</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleExport}
                className="bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Filters */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Analytics</h2>
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                {/* Mobile-friendly date range picker */}
                <label className="flex flex-col text-xs font-medium text-gray-600">
                  From
                  <input
                    type="date"
                    value={selectedFrom}
                    onChange={e => setSelectedFrom(e.target.value)}
                    className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-purple-400"
                    style={{ minWidth: 120 }}
                  />
                </label>
                <label className="flex flex-col text-xs font-medium text-gray-600">
                  To
                  <input
                    type="date"
                    value={selectedTo}
                    onChange={e => setSelectedTo(e.target.value)}
                    className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-purple-400"
                    style={{ minWidth: 120 }}
                  />
                </label>
                <Button
                  variant="outline"
                  onClick={() => { setSelectedFrom(""); setSelectedTo(""); }}
                  className="h-[38px]"
                >Clear</Button>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="flex flex-col items-center py-6">
              <div className="p-3 bg-blue-100 rounded-full mb-3">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <div className="text-lg font-semibold text-gray-700">Total Revenue</div>
              <div className="text-2xl font-bold text-blue-600">ZMW {totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="flex flex-col items-center py-6">
              <div className="p-3 bg-green-100 rounded-full mb-3">
                <Users className="text-green-600" size={24} />
              </div>
              <div className="text-lg font-semibold text-gray-700">Total Bookings</div>
              <div className="text-2xl font-bold text-green-600">{totalBookings.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="flex flex-col items-center py-6">
              <div className="p-3 bg-yellow-100 rounded-full mb-3">
                <Star className="text-yellow-600" size={24} />
              </div>
              <div className="text-lg font-semibold text-gray-700">Top Vendor</div>
              <div className="text-2xl font-bold text-yellow-600">{topVendor}</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="flex flex-col items-center py-6">
              <div className="p-3 bg-purple-100 rounded-full mb-3">
                <MapPin className="text-purple-600" size={24} />
              </div>
              <div className="text-lg font-semibold text-gray-700">Top Route</div>
              <div className="text-2xl font-bold text-purple-600">{topRoute}</div>
            </CardContent>
          </Card>
        </div>

        {isError ? (
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-red-600 text-center">Failed to load analytics data. Please try again later.</div>
            </CardContent>
          </Card>
        ) : (
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
            <CardContent className="p-6">
              <Tabs defaultValue="revenue" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Revenue
                  </TabsTrigger>
                  <TabsTrigger value="bookings" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Users className="h-4 w-4 mr-2" />
                    Bookings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="revenue" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="backdrop-blur-sm bg-white/60 border-0">
                      <CardHeader>
                        <CardTitle>Revenue Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RevenueTimeChart data={revenueData || []} isLoading={isRevenueLoading} />
                      </CardContent>
                    </Card>
                    <Card className="backdrop-blur-sm bg-white/60 border-0">
                      <CardHeader>
                        <CardTitle>Revenue Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RevenueDistributionChart data={vendorData || []} isLoading={isVendorLoading} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="bookings" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="backdrop-blur-sm bg-white/60 border-0">
                      <CardHeader>
                        <CardTitle>Bookings Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BookingsTimeChart data={bookingsData || []} isLoading={isBookingsLoading} />
                      </CardContent>
                    </Card>
                    <Card className="backdrop-blur-sm bg-white/60 border-0">
                      <CardHeader>
                        <CardTitle>Bookings Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BookingsDistributionChart data={routeData || []} isLoading={isRouteLoading} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}