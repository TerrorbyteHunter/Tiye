import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vendor } from '../api';

export const Layout = () => {
  const navigate = useNavigate();

  const { data: vendorData, isLoading } = useQuery({
    queryKey: ['vendor'],
    queryFn: () => vendor.getCurrent(),
    retry: false,
    staleTime: 30000,
  });

  React.useEffect(() => {
    if (!isLoading && !vendorData) {
      localStorage.removeItem('vendor_token');
      navigate('/login');
    }
  }, [vendorData, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vendorData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {vendorData.logo ? (
                <img
                  src={vendorData.logo}
                  alt={vendorData.name}
                  className="h-8 w-auto"
                />
              ) : (
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {vendorData.name.charAt(0)}
                </div>
              )}
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                {vendorData.name}
              </h1>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('vendor_token');
                navigate('/login');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}; 