import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { BackButton } from './shared/BackButton';
import { routes as routesApi } from '../lib/api';
import { FaBus, FaMoneyBillWave, FaChair, FaWifi, FaSnowflake, FaPlug, FaCoffee } from 'react-icons/fa';

// Icons for amenities
const WifiIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
  </svg>
);

const ACIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.25 4.5a3.25 3.25 0 006.5 0M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const ChargingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const RefreshmentsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

interface Bus {
  id: string;
  company: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  busType: string;
  amenities: string[];
  from: string;
  to: string;
  date: string;
}

interface TimeRange {
  label: string;
  start: string;
  end: string;
}

const timeRanges: TimeRange[] = [
  { label: 'Early Morning (00:00 - 06:00)', start: '00:00', end: '06:00' },
  { label: 'Morning (06:00 - 12:00)', start: '06:00', end: '12:00' },
  { label: 'Afternoon (12:00 - 18:00)', start: '12:00', end: '18:00' },
  { label: 'Evening (18:00 - 23:59)', start: '18:00', end: '23:59' }
];

// Helper to format time as HH:mm
const formatTime = (timeString: string): string => {
  if (!timeString) return 'N/A';
  // If it's a time-only string (e.g., '08:00' or '08:00:00'), just return the first 5 chars
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) return timeString.slice(0,5);
  const date = new Date(timeString);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

// Helper to ensure a valid YYYY-MM-DD date string
const getValidDate = (dateString: string) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

export const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  const isTimeInRange = (time: string, range: TimeRange) => {
    const [hours, minutes] = time.split(':').map(Number);
    const [startHours, startMinutes] = range.start.split(':').map(Number);
    const [endHours, endMinutes] = range.end.split(':').map(Number);
    const timeValue = hours * 60 + minutes;
    const startValue = startHours * 60 + startMinutes;
    const endValue = endHours * 60 + endMinutes;
    return timeValue >= startValue && timeValue <= endValue;
  };

  const filteredBuses = selectedTimeRange === 'all' 
    ? buses 
    : buses.filter(bus => {
        const selectedRange = timeRanges.find(range => range.label === selectedTimeRange);
        return selectedRange ? isTimeInRange(bus.departureTime, selectedRange) : true;
      });

  useEffect(() => {
    const fetchBuses = async () => {
      setIsLoading(true);
      try {
        const response = await routesApi.getAll();
        const allRoutes = response.data;
        const mappedBuses: Bus[] = allRoutes
          .filter((route: any) => {
            const matchesFrom = !from || route.departure.trim().toLowerCase() === from.trim().toLowerCase();
            const matchesTo = !to || route.destination.trim().toLowerCase() === to.trim().toLowerCase();
            return matchesFrom && matchesTo;
          })
          .map((route: any) => ({
            id: route.id?.toString() || route.routeId?.toString() || '',
            company: route.vendorname || route.vendor || route.vendor_name || route.bus_vendor || 'Bus Vendor',
            departureTime: route.departureTime || route.departure_time || route.departTime || route.depart || '',
            arrivalTime: route.arrivalTime || route.arrival_time || route.arriveTime || route.arrive || '',
            price: route.fare || route.price || 0,
            availableSeats: route.capacity || route.availableSeats || 0,
            busType: route.busType || 'Standard',
            amenities: route.amenities || [],
            from: route.departure || route.from || '',
            to: route.destination || route.to || '',
            // Use the backend's departureTime as the date for each bus
            date: getValidDate(route.departureTime || route.departure_time || route.departTime || route.depart || ''),
            vendorId: route.vendorid || route.vendorId || 1,
          }));
        setBuses(mappedBuses);
      } catch (error) {
        setBuses([]);
      }
      setIsLoading(false);
    };
    fetchBuses();
  }, [from, to, date]);

  // Debug log for search/filter state
  console.log({ from, to, date, buses });
  if (buses.length > 0) {
    buses.forEach((bus, idx) => {
      console.log(`Bus #${idx + 1}:`, {
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
      });
    });
  }

  const handleSelectBus = (busId: string) => {
    // Find the selected bus
    const selectedBus = buses.find(bus => bus.id === busId);
    if (selectedBus) {
      // Navigate with bus data
      navigate(`/select-seats/${busId}`, {
        state: {
          bus: {
            ...selectedBus,
            date: getValidDate(selectedBus.date)
          },
          from: selectedBus.from,
          to: selectedBus.to,
          date: getValidDate(selectedBus.date),
          departureTime: selectedBus.departureTime,
          arrivalTime: selectedBus.arrivalTime,
          price: selectedBus.price,
          company: selectedBus.company,
          busType: selectedBus.busType
        }
      });
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'AC':
        return '❄️';
      case 'WiFi':
        return '📶';
      case 'USB Charging':
        return '🔌';
      case 'Toilet':
        return '🚽';
      case 'Refreshments':
        return '☕';
      default:
        return '✓';
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen py-4 sm:py-8 flex flex-col" style={{ background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #d4a1fd 100%)' }}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full">

        <div className="bg-transparent rounded-lg shadow-none p-0">
          <div className="mb-4 sm:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 drop-shadow">Available Buses</h2>
              <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-700 font-medium drop-shadow">
                {from} to {to} on {formatDate(date)}
              </p>
            </div>
            {/* Time Filter */}
            <div className="relative">
              <label htmlFor="timeFilter" className="sr-only">Filter by departure time</label>
              <select
                id="timeFilter"
                value={selectedTimeRange}
                onChange={e => setSelectedTimeRange(e.target.value)}
                className="block w-full py-1.5 sm:py-2 px-3 sm:px-4 pr-8 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-700 bg-white bg-opacity-80 backdrop-blur"
              >
                <option value="all">All Times</option>
                {timeRanges.map(range => (
                  <option key={range.label} value={range.label}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : filteredBuses.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="flex justify-center mb-4"><FaBus color="#BFDBFE" size={40} /></div>
              <p className="text-lg font-semibold">No buses found for your search.</p>
              <p className="text-sm">Try changing your search criteria.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:gap-4 mt-2 sm:mt-4">
              {filteredBuses.map(bus => (
                <div
                  key={bus.id}
                  className="bg-white bg-opacity-90 rounded-lg shadow border border-gray-100 hover:border-blue-400 transition-all flex flex-col gap-1 p-2 group sm:rounded-2xl sm:shadow-xl sm:gap-4 sm:p-8"
                >
                  {/* Top Row: Company & Price (mobile: row, desktop: col) */}
                  <div className="flex items-center justify-between gap-2 w-full sm:flex-col sm:items-start sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-3">
                      <div className="flex items-center justify-center bg-blue-100 rounded w-6 h-6 sm:w-12 sm:h-12">
                        <FaBus color="#3B82F6" size={14} />
                      </div>
                      <span className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors sm:text-xl">{bus.company}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <FaMoneyBillWave color="#22C55E" size={14} />
                      <span className="text-base font-bold text-gray-900 sm:text-2xl">K {bus.price}</span>
                    </div>
                  </div>
                  {/* Route Row: From → To, Times */}
                  <div className="flex flex-wrap items-center justify-between gap-1 w-full sm:flex-col sm:items-start sm:gap-2">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-700 sm:text-base sm:gap-2">
                      <span className="font-bold text-blue-600">{bus.from}</span>
                      <span className="mx-1 text-gray-400 sm:mx-2">→</span>
                      <span className="font-bold text-green-600">{bus.to}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 sm:text-sm sm:gap-6">
                      <span><span className="font-semibold text-gray-700">Departure:</span> {formatTime(bus.departureTime)}</span>
                      <span><span className="font-semibold text-gray-700">Arrival:</span> {formatTime(bus.arrivalTime)}</span>
                    </div>
                  </div>
                  {/* Amenities, Seats, Bus Type, Button (all in one row for mobile) */}
                  <div className="flex items-center justify-between gap-1 w-full mt-1 sm:flex-row sm:gap-4 sm:mt-2">
                    <div className="flex items-center gap-1 flex-wrap sm:gap-3">
                      {bus.amenities?.includes('WiFi') && <FaWifi color="#60A5FA" size={12} title="WiFi" />}
                      {bus.amenities?.includes('AC') && <FaSnowflake color="#7DD3FC" size={12} title="Air Conditioning" />}
                      {bus.amenities?.includes('USB Charging') && <FaPlug color="#F59E42" size={12} title="USB Charging" />}
                      {bus.amenities?.includes('Refreshments') && <FaCoffee color="#059669" size={12} title="Refreshments" />}
                      <FaChair color="#9CA3AF" size={12} title="Seats" />
                      <span className="text-[10px] text-gray-500 ml-1 sm:text-xs sm:ml-2">{bus.availableSeats} seats</span>
                      <span className="ml-2 px-1 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold sm:ml-4 sm:px-2 sm:text-xs">{bus.busType}</span>
                    </div>
                    <button
                      className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded shadow transition-colors text-xs sm:px-8 sm:py-2 sm:text-base"
                      onClick={() => handleSelectBus(bus.id)}
                    >
                      Select Seats
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 