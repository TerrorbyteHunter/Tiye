import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { BarChart2, Users as UsersIcon, Calendar as CalendarIcon } from 'lucide-react';
import { EmptyState } from '../../../../packages/ui/src/components/EmptyState';
import { BarChart3 } from 'lucide-react';

interface SalesUser {
  userId: number;
  name: string;
  email: string;
  walkInTickets: number;
  walkInRevenue: number;
  onlineTickets: number;
  onlineRevenue: number;
  totalTickets: number;
  totalRevenue: number;
}

const fetchSales = async (date: string): Promise<SalesUser[]> => {
  const { data } = await api.get('/vendor/sales', { params: { date } });
  return data;
};

export default function Sales() {
  const [date, setDate] = React.useState(() => new Date().toISOString().split('T')[0]);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['sales', date],
    queryFn: () => fetchSales(date),
  });

  // Calculate totals
  const totalTickets = data?.reduce((sum, u) => sum + u.totalTickets, 0) || 0;
  const totalRevenue = data?.reduce((sum, u) => sum + u.totalRevenue, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Summary Card */}
      <Card className="mb-8 glass shadow-xl border-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart2 className="h-7 w-7 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Sales Summary</h1>
              <p className="text-gray-600 mt-1">View ticket sales and revenue by user</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-xl font-bold text-indigo-700">
                <UsersIcon className="h-5 w-5" />
                {totalTickets}
              </div>
              <div className="text-xs text-indigo-400">Total Tickets</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-xl font-bold text-green-700">
                <BarChart2 className="h-5 w-5" />
                K{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-green-500">Total Revenue</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-indigo-400" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 bg-white/80 shadow"
            />
          </div>
        </div>
      </Card>
      {/* Data Table Card */}
      <Card className="glass shadow-xl border-0">
        {isLoading ? (
          <div className="text-gray-600 p-8">Loading sales data...</div>
        ) : isError ? (
          <div className="text-red-600 p-8">Failed to load sales data.</div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No sales data"
            description="There are no sales for this date."
            icon={<BarChart3 className="w-12 h-12" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-transparent rounded">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100">
                  <th className="px-4 py-2 text-left font-semibold text-indigo-700">User</th>
                  <th className="px-4 py-2 text-left font-semibold text-indigo-700">Email</th>
                  <th className="px-4 py-2 text-right font-semibold text-blue-700">Walk-in Tickets</th>
                  <th className="px-4 py-2 text-right font-semibold text-green-700">Walk-in Revenue</th>
                  <th className="px-4 py-2 text-right font-semibold text-blue-700">Online Tickets</th>
                  <th className="px-4 py-2 text-right font-semibold text-green-700">Online Revenue</th>
                  <th className="px-4 py-2 text-right font-semibold text-indigo-700">Total Tickets</th>
                  <th className="px-4 py-2 text-right font-semibold text-green-700">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.map(user => (
                  <tr key={user.userId} className="border-t border-indigo-50 hover:bg-indigo-50/40 transition">
                    <td className="px-4 py-2 font-medium text-indigo-900">{user.name}</td>
                    <td className="px-4 py-2 text-indigo-700">{user.email}</td>
                    <td className="px-4 py-2 text-right">{user.walkInTickets}</td>
                    <td className="px-4 py-2 text-right"><Badge variant="success">K{user.walkInRevenue.toFixed(2)}</Badge></td>
                    <td className="px-4 py-2 text-right">{user.onlineTickets}</td>
                    <td className="px-4 py-2 text-right"><Badge variant="secondary">K{user.onlineRevenue.toFixed(2)}</Badge></td>
                    <td className="px-4 py-2 text-right font-semibold text-indigo-800">{user.totalTickets}</td>
                    <td className="px-4 py-2 text-right font-semibold text-green-700">K{user.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 