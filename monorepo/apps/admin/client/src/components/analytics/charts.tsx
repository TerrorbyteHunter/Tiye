import * as React from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface TimeSeriesData {
  date: string;
  value: number;
}

interface DistributionData {
  name: string;
  value: number;
}

interface ChartProps {
  data: any[];
  isLoading: boolean;
}

export const RevenueTimeChart: React.FC<ChartProps> = ({ data, isLoading }) => {
  if (isLoading) return <Skeleton className="h-[300px]" />;
  if (!data || data.length === 0) return <div style={{textAlign: 'center', padding: '2rem'}}>No data available for this period.</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
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
  );
};

export const RevenueDistributionChart: React.FC<ChartProps> = ({ data, isLoading }) => {
  if (isLoading) return <Skeleton className="h-[300px]" />;
  if (!data || data.length === 0) return <div style={{textAlign: 'center', padding: '2rem'}}>No data available for this period.</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${((percent || 0) * 100).toFixed(0)}%`
          }
        >
          {data?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const BookingsTimeChart: React.FC<ChartProps> = ({ data, isLoading }) => {
  if (isLoading) return <Skeleton className="h-[300px]" />;
  if (!data || data.length === 0) return <div style={{textAlign: 'center', padding: '2rem'}}>No data available for this period.</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
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
  );
};

export const BookingsDistributionChart: React.FC<ChartProps> = ({ data, isLoading }) => {
  if (isLoading) return <Skeleton className="h-[300px]" />;
  if (!data || data.length === 0) return <div style={{textAlign: 'center', padding: '2rem'}}>No data available for this period.</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#82ca9d"
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${((percent || 0) * 100).toFixed(0)}%`
          }
        >
          {data?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}; 