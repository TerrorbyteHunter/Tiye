import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tickets } from '../lib/api';

interface Seat {
  id: number;
  isAvailable: boolean;
  isSelected: boolean;
  row: number;
  position: 'left' | 'right';
}

interface SeatReservationsProps {
  routeId: number;
}

export function SeatReservations({ routeId }: SeatReservationsProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  // Fetch tickets for the route
  const { data: routeTickets, isLoading } = useQuery({
    queryKey: ['tickets', routeId],
    queryFn: () => tickets.getByRoute(routeId),
  });

  useEffect(() => {
    // Generate seats for a typical bus layout (8 rows of 4 seats + back row of 4)
    const generatedSeats = [
      // Regular rows (8 rows x 4 seats)
      ...Array.from({ length: 8 }, (_, rowIndex) =>
        Array.from({ length: 4 }, (_, seatIndex) => ({
          id: rowIndex * 4 + seatIndex + 1,
          isAvailable: true,
          isSelected: false,
          row: rowIndex + 1,
          position: seatIndex < 2 ? 'left' : 'right'
        }))
      ).flat(),
      // Back row (4 seats)
      ...Array.from({ length: 4 }, (_, i) => ({
        id: 33 + i,
        isAvailable: true,
        isSelected: false,
        row: 9,
        position: i < 2 ? 'left' : 'right'
      }))
    ] as Seat[];

    // Mark seats as unavailable if they have tickets
    if (routeTickets) {
      routeTickets.forEach(ticket => {
        const seat = generatedSeats.find(s => s.id === ticket.seatNumber);
        if (seat) {
          seat.isAvailable = false;
        }
      });
    }

    setSeats(generatedSeats);
  }, [routeTickets]);

  const handleSeatClick = (seatId: number) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat?.isAvailable) return;

    setSeats(seats.map(s => 
      s.id === seatId ? { ...s, isSelected: !s.isSelected } : s
    ));

    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Seat Reservations</h3>
      
      {/* Seat Legend */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Seat Status Guide</h4>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg border-2 border-gray-300 bg-white mr-2 flex items-center justify-center text-gray-400 text-xs">12</div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-gray-300 mr-2 flex items-center justify-center text-white text-xs">08</div>
            <span className="text-sm text-gray-600">Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-blue-600 mr-2 flex items-center justify-center text-white text-xs">15</div>
            <span className="text-sm text-gray-600">Selected</span>
          </div>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="max-w-4xl mx-auto">
        {/* Bus Shell */}
        <div className="relative border-2 border-gray-300 rounded-lg p-4">
          {/* Driver's Area */}
          <div className="absolute -top-4 right-8 bg-white px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Driver</span>
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Seats Layout */}
          <div className="space-y-2">
            {Array.from({ length: 8 }, (_, rowIndex) => (
              <div key={`row-${rowIndex + 1}`} className="flex justify-center">
                {/* Left pair */}
                <div className="flex gap-1">
                  {seats
                    .filter(seat => seat.row === rowIndex + 1 && seat.position === 'left')
                    .map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat.id)}
                        disabled={!seat.isAvailable}
                        className={`
                          w-14 h-14 rounded-lg flex items-center justify-center relative text-sm font-medium
                          ${!seat.isAvailable 
                            ? 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed' 
                            : seat.isSelected 
                            ? 'bg-blue-600 border-2 border-blue-700 text-white shadow-md' 
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'
                          }
                          transition-all duration-200
                        `}
                      >
                        <span>{seat.id}</span>
                      </button>
                    ))}
                </div>
                
                {/* Aisle */}
                <div className="w-8 mx-2"></div>
                
                {/* Right pair */}
                <div className="flex gap-1">
                  {seats
                    .filter(seat => seat.row === rowIndex + 1 && seat.position === 'right')
                    .map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat.id)}
                        disabled={!seat.isAvailable}
                        className={`
                          w-14 h-14 rounded-lg flex items-center justify-center relative text-sm font-medium
                          ${!seat.isAvailable 
                            ? 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed' 
                            : seat.isSelected 
                            ? 'bg-blue-600 border-2 border-blue-700 text-white shadow-md' 
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'
                          }
                          transition-all duration-200
                        `}
                      >
                        <span>{seat.id}</span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Seats</h4>
          <p className="text-sm text-blue-700">
            {selectedSeats.sort((a, b) => a - b).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
} 