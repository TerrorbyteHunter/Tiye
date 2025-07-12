import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface ChartDataPoint {
  name?: string;
  date?: string;
  revenue?: number;
  bookings?: number;
  value?: number;
  percent?: number;
}

interface ChartData {
  revenueData?: ChartDataPoint[];
  bookingDistribution?: ChartDataPoint[];
  revenueDistribution?: ChartDataPoint[];
  bookingsData?: ChartDataPoint[];
}

// Revenue chart
export function RevenueChart({ isLoading = false, data = [] }: { isLoading?: boolean; data?: ChartDataPoint[] }) {
  const [timeframe, setTimeframe] = useState("7");
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No revenue data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Booking distribution chart
export function BookingDistributionChart({ isLoading = false, data = [] }: { isLoading?: boolean; data?: ChartDataPoint[] }) {
  const [timeframe, setTimeframe] = useState("30");
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Booking Distribution by Vendor</CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last 12 months</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#82ca9d"
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No booking distribution data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Revenue distribution chart
export function RevenueDistributionChart({ isLoading = false, data = [] }: { isLoading?: boolean; data?: ChartDataPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Revenue by Vendor</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No revenue distribution data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Bookings time chart
export function BookingsTimeChart({ isLoading = false, data = [] }: { isLoading?: boolean; data?: ChartDataPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Bookings Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No booking data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PerformanceCharts({ isLoading = false, chartData = {} }: { isLoading?: boolean; chartData?: ChartData }) {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800">Performance Analytics</h3>
        <p className="mt-1 text-sm text-gray-500">System performance and key metrics over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart isLoading={isLoading} data={chartData.revenueData || []} />
        <BookingDistributionChart isLoading={isLoading} data={chartData.bookingDistribution || []} />
        <RevenueDistributionChart isLoading={isLoading} data={chartData.revenueDistribution || []} />
        <BookingsTimeChart isLoading={isLoading} data={chartData.bookingsData || []} />
      </div>
    </div>
  );
}
