import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BackButton } from './shared/BackButton';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { RouteMap } from './shared/RouteMap';
import { routes as routesApi } from '../lib/api';
import { FaBus, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaBuilding } from 'react-icons/fa';

interface Seat {
  id: number;
  isAvailable: boolean;
  isSelected: boolean;
  row: number;
  position: 'left' | 'right';
}

interface BusData {
  bus: {
    id: string;
    company: string;
    from: string;
    to: string;
    date: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
    busType: string;
  };
}

// Helper to format time as HH:mm
const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

// Helper to ensure a valid YYYY-MM-DD date string
const getValidDate = (date: string) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

export const SeatSelection: React.FC = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const busData = location.state as BusData;
  
  const [isLoading, setIsLoading] = useState(true);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [stops, setStops] = useState<any[]>([]);
  const [warning, setWarning] = useState('');

  const MAX_SELECTION = 5;

  useEffect(() => {
    const fetchSeats = async () => {
      if (!busData) {
        navigate('/');
        return;
      }
      setIsLoading(true);
      const validDate = getValidDate(busData.bus.date);
      if (!validDate) {
        setSeats([]);
        setIsLoading(false);
        setWarning('Invalid travel date selected. Please go back and choose a valid date.');
        return;
      }
      try {
        const response = await routesApi.getSeats(busData.bus.id, validDate);
        const backendSeats = response.data.seats || [];
        const mappedSeats: Seat[] = backendSeats.map((seat: any) => ({
          id: seat.number,
          isAvailable: seat.status === 'available',
          isSelected: false,
          row: Math.ceil(seat.number / 4),
          position: (seat.number - 1) % 4 < 2 ? 'left' : 'right',
        }));
        setSeats(mappedSeats);
      } catch (error) {
        setSeats([]);
      }
      setIsLoading(false);
    };
    fetchSeats();
  }, [busData, navigate]);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const response = await routesApi.getById(Number(busData.bus.id));
        setStops(response.data.stops || []);
      } catch (error) {
        setStops([]);
      }
    };
    fetchStops();
  }, [busData.bus.id]);

  const handleSeatClick = (seatId: number) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat?.isAvailable) return;
    if (!seat.isSelected && selectedSeats.length >= MAX_SELECTION) {
      setWarning(`You can only select up to ${MAX_SELECTION} seats.`);
      setTimeout(() => setWarning(''), 2000);
      return;
    }
    setSeats(seats.map(s => 
      s.id === seatId ? { ...s, isSelected: !s.isSelected } : s
    ));
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? (Array.isArray(prev) ? prev.filter(id => id !== seatId) : [])
        : [...prev, seatId]
    );
  };

  const totalPrice = (busData?.bus.price || 0) * selectedSeats.length;

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    navigate('/checkout', { 
      state: { 
        selectedSeats,
        totalPrice,
        busId,
        busData
      } 
    });
  };

  if (!busData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">No bus data available. Please select a bus first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 flex flex-col" style={{ background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #d4a1fd 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" text="Loading seat layout..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
                {/* Trip Details */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-6 relative">
                  {/* Absolutely positioned vendor name */}
                  <div className="absolute top-0 left-0 right-0 w-full z-20 bg-white/80 px-3 py-1 flex items-center gap-2 whitespace-nowrap overflow-x-auto">
                    <span style={{width:16,height:16,display:'inline-flex',alignItems:'center'}}><FaBuilding color="#8B5CF6" /></span>
                    <span className="text-xs sm:text-sm text-gray-500">Bus Company</span>
                    <span className="font-medium text-xs sm:text-sm flex-1 min-w-0 flex items-center whitespace-nowrap max-w-full overflow-x-auto">{busData.bus.company}{busData.bus.busType && busData.bus.busType !== 'Standard' && (<span className="ml-1 text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">({busData.bus.busType})</span>)}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 items-center pt-8">
                    <div className="flex items-center gap-1 sm:gap-2"><span style={{width:16,height:16,display:'inline-flex',alignItems:'center'}}><FaMapMarkerAlt color="#3B82F6" /></span> <span className="text-xs sm:text-sm text-gray-500">From</span> <span className="font-medium ml-1 text-xs sm:text-sm">{busData.bus.from}</span></div>
                    <div className="flex items-center gap-1 sm:gap-2"><span style={{width:16,height:16,display:'inline-flex',alignItems:'center'}}><FaMapMarkerAlt color="#059669" /></span> <span className="text-xs sm:text-sm text-gray-500">To</span> <span className="font-medium ml-1 text-xs sm:text-sm">{busData.bus.to}</span></div>
                    <div className="flex items-center gap-1 sm:gap-2"><span style={{width:16,height:16,display:'inline-flex',alignItems:'center'}}><FaCalendarAlt color="#F59E42" /></span> <span className="text-xs sm:text-sm text-gray-500">Date</span> <span className="font-medium ml-1 text-xs sm:text-sm">{new Date(busData.bus.date).toLocaleDateString('en-GB')}</span></div>
                    <div className="flex items-center gap-1 sm:gap-2"><span style={{width:16,height:16,display:'inline-flex',alignItems:'center'}}><FaClock color="#6366F1" /></span> <span className="text-xs sm:text-sm text-gray-500">Time</span> <span className="font-medium ml-1 text-xs sm:text-sm">{formatTime(busData.bus.departureTime)}</span></div>
                  </div>
                </div>

                {/* Seat Legend */}
                <div className="p-4 sm:p-6 border-b border-gray-200 bg-white bg-opacity-60 rounded-b-xl">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-4">Seat Status Guide</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-8">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg border-2 border-green-700 bg-green-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs sm:text-base">✓</span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Available</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-400 border-2 border-red-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xs sm:text-base">✗</span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Booked</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-600 border-2 border-blue-800 flex items-center justify-center">
                        <span className="text-white font-bold text-xs sm:text-base">★</span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Selected</span>
                    </div>
                  </div>
                </div>

                {/* Bus Layout */}
                <div className="p-3 sm:p-6">
                  <div className="max-w-4xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-3 sm:p-8">
                    <div className="flex flex-col items-center mb-3 sm:mb-6">
                      <FaBus color="#3B82F6" size={28} />
                      <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-1 sm:mt-2">Select Your Seat</h3>
                    </div>
                    {/* Bus Shell */}
                    <div className="relative border-2 border-gray-300 rounded-lg p-2 sm:p-4 max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50">
                      {/* Driver's Area */}
                      <div className="absolute -top-3 sm:-top-4 right-4 sm:right-8 bg-white px-1 sm:px-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-[10px] sm:text-xs text-gray-500">Driver</span>
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {/* Seats Layout */}
                      <div className="space-y-1 sm:space-y-2">
                        {Array.from({ length: 8 }, (_, rowIndex) => (
                          <div key={`row-${rowIndex + 1}`} className="flex justify-center">
                            {/* Left pair */}
                            <div className="flex gap-0.5 sm:gap-1">
                              {seats
                                .filter(seat => seat.row === rowIndex + 1 && seat.position === 'left')
                                .map(seat => (
                                  <button
                                    key={seat.id}
                                    onClick={() => handleSeatClick(seat.id)}
                                    disabled={!seat.isAvailable}
                                    className={
                                      `w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center relative text-xs sm:text-lg font-bold
                                      transition-all duration-200
                                      ${!seat.isAvailable 
                                        ? 'bg-red-400 text-white cursor-not-allowed' 
                                        : seat.isSelected 
                                        ? 'bg-blue-600 border-2 border-blue-700 text-white shadow-lg scale-105' 
                                        : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'}
                                      `
                                    }
                                    style={{ transition: 'transform 0.15s' }}
                                    title={!seat.isAvailable ? 'Booked' : 'Available'}
                                  >
                                    <span>{seat.id}</span>
                                    {seat.isSelected && (
                                      <span className="absolute top-0.5 right-0.5 text-white">
                                        <svg className="w-2 h-2 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </span>
                                    )}
                                  </button>
                                ))}
                            </div>
                            {/* Aisle */}
                            <div className="w-3 sm:w-8 mx-1 sm:mx-2"></div>
                            {/* Right pair */}
                            <div className="flex gap-0.5 sm:gap-1">
                              {seats
                                .filter(seat => seat.row === rowIndex + 1 && seat.position === 'right')
                                .map(seat => (
                                  <button
                                    key={seat.id}
                                    onClick={() => handleSeatClick(seat.id)}
                                    disabled={!seat.isAvailable}
                                    className={
                                      `w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center relative text-xs sm:text-lg font-bold
                                      transition-all duration-200
                                      ${!seat.isAvailable 
                                        ? 'bg-red-400 text-white cursor-not-allowed' 
                                        : seat.isSelected 
                                        ? 'bg-blue-600 border-2 border-blue-700 text-white shadow-lg scale-105' 
                                        : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'}
                                      `
                                    }
                                    style={{ transition: 'transform 0.15s' }}
                                    title={!seat.isAvailable ? 'Booked' : 'Available'}
                                  >
                                    <span>{seat.id}</span>
                                    {seat.isSelected && (
                                      <span className="absolute top-0.5 right-0.5 text-white">
                                        <svg className="w-2 h-2 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </span>
                                    )}
                                  </button>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Sidebar: Summary & Proceed */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>
                <div className="flex flex-col gap-2 text-gray-700">
                  <span>Selected Seats: <span className="font-semibold text-blue-700">{selectedSeats.join(', ') || 'None'}</span></span>
                  <span>Total Price: <span className="font-semibold text-green-600">K {totalPrice}</span></span>
                </div>
                {warning && <div className="mt-4 text-red-500 font-semibold">{warning}</div>}
                <button
                  className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
                  disabled={selectedSeats.length === 0}
                  onClick={handleProceed}
                >
                  Proceed to Checkout
                </button>
                {/* Route Map (stops) */}
                <div className="mt-8">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">Route & Stops</h4>
                  <RouteMap
                    from={busData.bus.from}
                    to={busData.bus.to}
                    stops={stops.map((stop: string, i: number) => ({ name: stop, time: '', distance: '' }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};