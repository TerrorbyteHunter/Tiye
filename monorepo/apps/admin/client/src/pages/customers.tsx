import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, TrendingUp, Calendar, Phone, Mail, ShoppingCart } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  created_at: string;
  last_login?: string;
  booking_count: number;
}

export default function Customers() {
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    },
  });

  // Calculate customer statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c: Customer) => c.last_login).length;
  const totalBookings = customers.reduce((sum: number, c: Customer) => sum + c.booking_count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl mb-8 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Customer Management</h1>
              <p className="text-teal-100">Monitor and manage customer accounts and activities</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="hidden md:block w-1 h-12 bg-white/30 rounded-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalCustomers}</div>
                  <div className="text-xs text-teal-200">Total Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{activeCustomers}</div>
                  <div className="text-xs text-teal-200">Active Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <div className="text-xs text-teal-200">Total Bookings</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
              <Button 
                className="bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics
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
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Customer Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading customers...</span>
              </div>
            )}
            
            {error && (
              <div className="text-red-500 text-center py-8">
                Error loading customers. Please try again later.
              </div>
            )}
            
            {!isLoading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Name
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Mobile
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Created At
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Last Login
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Bookings
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No customers found</p>
                          <p className="text-sm">Customers will appear here once they register</p>
                        </td>
                      </tr>
                    ) : (
                      customers.map((c: Customer) => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{c.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{c.mobile}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{c.email || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(c.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {c.last_login ? new Date(c.last_login).toLocaleDateString() : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {c.booking_count}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 