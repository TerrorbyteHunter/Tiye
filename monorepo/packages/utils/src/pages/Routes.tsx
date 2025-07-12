import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { routes } from '../api';
import { Route } from '../types/schema';
import { SeatReservations } from '../components/SeatReservations';

export const Routes = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

  const { data: routeList, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: () => routes.list(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Routes</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Routes List */}
        <div className="lg:col-span-1 space-y-4">
          {routeList?.map((route: Route) => (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${selectedRouteId === route.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{route.departure} → {route.destination}</h3>
                  <p className="text-sm text-gray-500">Departure: {route.departureTime}</p>
                </div>
                <span className={`
                  px-2 py-1 text-xs rounded-full
                  ${route.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                  }
                `}>
                  {route.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Fare: K {route.fare}</p>
                <p>Capacity: {route.capacity} seats</p>
              </div>
            </div>
          ))}
        </div>

        {/* Seat Reservations */}
        <div className="lg:col-span-2">
          {selectedRouteId ? (
            <SeatReservations routeId={selectedRouteId} />
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">Select a route to view seat reservations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 