import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routes } from '../lib/api';
import { Calendar, Clock, MapPin, Users, Search, Filter, ChevronDown } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

interface Trip {
  id: number;
  departure: string;
  destination: string;
  departuretime: string;
  estimatedarrival: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
  seats: {
    number: number;
    status: 'available' | 'booked' | 'reserved';
    passengerName?: string;
  }[];
  plateNumber?: string;
  fare: number;
  daysOfWeek?: string[];
}

interface FilterState {
  date: string;
  time: string;
  status: string;
  route: string;
  sortBy: 'departuretime' | 'route' | 'status' | 'seats';
}

export default function Schedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTrip, setSelectedTrip] = React.useState<Trip | null>(null);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<FilterState>({
    date: '',
    time: '',
    status: 'all',
    route: '',
    sortBy: 'departuretime',
  });

  // Add debug state
  const [debugInfo, setDebugInfo] = React.useState<any>(null);

  // --- Booking modal state ---
  const [showBookingModal, setShowBookingModal] = React.useState(false);
  const [bookingSeat, setBookingSeat] = React.useState<any>(null);
  const [bookingForm, setBookingForm] = React.useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
  });
  const [bookingLoading, setBookingLoading] = React.useState(false);

  // Add this state to track seats for the selected trip and date
  const [tripSeats, setTripSeats] = React.useState<any[]>([]);
  const [seatsLoading, setSeatsLoading] = React.useState(false);

  // State for triggering seat refetch
  const [seatRefetchTrigger, setSeatRefetchTrigger] = React.useState(0);

  const { data: activeTrips = [], isLoading, error } = useQuery<Trip[]>({
    queryKey: ['active-trips', filters.date],
    queryFn: async () => {
      try {
        console.log('Starting to fetch active trips...');

        // Check authentication (add this back if you want to verify the token presence in this component)
        // const token = localStorage.getItem('token');
        // console.log('Auth token present:', !!token);

        const response = await routes.getWithReservations(filters.date);
        console.log('Raw API response:', response);

        if (!response || !Array.isArray(response)) {
          console.error('Invalid response format:', response);
          setDebugInfo({ error: 'Invalid response format', response }); // Update debug state on error
          throw new Error('Invalid response format from server');
        }

        // Transform the response to match our Trip interface
        const transformedTrips = response
          .map((route: any) => {
            if (!route || typeof route !== 'object') return undefined;
            try {
              return {
                id: route.id,
                departure: route.departure,
                destination: route.destination,
                departuretime: route.departuretime,
                estimatedarrival: route.estimatedarrival,
                totalSeats: route.totalSeats || route.capacity,
                bookedSeats: route.bookedSeats || 0,
                availableSeats: route.availableSeats || (route.capacity - (route.bookedSeats || 0)),
                status: route.status,
                seats: Array.isArray(route.seats) ? route.seats : [],
                plateNumber: route.plateNumber,
                fare: route.fare,
                daysOfWeek: route.daysOfWeek,
              } as Trip;
            } catch {
              return undefined;
            }
          })
          .filter((t): t is Trip => t !== undefined);

        console.log('Final transformed trips:', transformedTrips);
        setDebugInfo({ success: true, count: transformedTrips.length }); // Update debug state on success
        return transformedTrips;
      } catch (error) {
        console.error('Error in queryFn:', error);
        setDebugInfo({ error: 'Query function error', details: error }); // Update debug state on error
        throw error; // Re-throw to let React Query handle the error
      }
    },
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retrying
  });

  // Enhanced debug logging
  React.useEffect(() => {
    console.log('Component state:', {
      isLoading,
      error,
      activeTripsCount: activeTrips.length,
      selectedTripId: selectedTrip?.id,
      debugInfo // Log debug info state
    });
  }, [isLoading, error, activeTrips, selectedTrip, debugInfo]); // Include debugInfo in dependency array

  // Fetch seats for the selected trip and date
  React.useEffect(() => {
    async function fetchSeats() {
      if (!selectedTrip) {
        setTripSeats([]);
        return;
      }
      setSeatsLoading(true);
      try {
        // Use the selected date filter, or if no filter is set, use today's date
        const travelDate = filters.date || new Date().toISOString().slice(0, 10);
        console.log('Fetching seats for route:', selectedTrip.id, 'on date:', travelDate);
        const response = await routes.getSeatReservations(selectedTrip.id, travelDate);
        console.log('Seats response:', response);
        setTripSeats(response);
      } catch (err) {
        console.error('Error fetching seats:', err);
        setTripSeats([]);
      } finally {
        setSeatsLoading(false);
      }
    }
    fetchSeats();
  }, [selectedTrip, filters.date, seatRefetchTrigger]);

  const reserveSeatMutation = useMutation({
    mutationFn: (data: { routeId: number; seatData: any }) =>
      routes.reserveSeat(data.routeId, data.seatData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-trips'] });
      // Trigger seat refetch
      setSeatRefetchTrigger(prev => prev + 1);
      toast({
        title: "Seat Reserved",
        description: "The seat has been reserved successfully.",
      });
    },
    onError: (error) => {
      console.error('Reserve seat error:', error); // Add error logging
      toast({
        title: "Error",
        description: "Failed to reserve the seat. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: (data: { routeId: number; seatId: number }) =>
      routes.cancelReservation(data.routeId, data.seatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-trips'] });
      // Trigger seat refetch
      setSeatRefetchTrigger(prev => prev + 1);
      toast({
        title: "Reservation Cancelled",
        description: "The seat reservation has been cancelled.",
      });
    },
    onError: (error) => {
      console.error('Cancel reservation error:', error); // Add error logging
      toast({
        title: "Error",
        description: "Failed to cancel the reservation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add a helper to get today's date string in YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  // Helper to get today's day of the week in lowercase (e.g., 'monday')
  const getDayOfWeek = (dateString?: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  // Helper to get a Date object for the trip's departure (today's date + departuretime)
  function getTripDepartureDate(trip) {
    if (!trip.departuretime) return null;
    // Use the date part from estimatedarrival or today, and the time from departuretime
    let datePart = '';
    if (trip.estimatedarrival) {
      datePart = new Date(trip.estimatedarrival).toISOString().slice(0, 10);
    } else {
      datePart = getTodayString();
    }
    return new Date(`${datePart}T${trip.departuretime}`);
  }

  // In the filteredTrips useMemo, filter by today's date if no filter is set
  const filteredTrips = React.useMemo(() => {
    const filterDay = filters.date
      ? getDayOfWeek(filters.date)
      : getDayOfWeek();
    return activeTrips.filter(trip => {
      const routeString = `${trip.departure} → ${trip.destination}`.toLowerCase();
      const matchesSearch = searchTerm === '' || routeString.includes(searchTerm.toLowerCase());
      // Show trips that operate on the selected day
      const matchesDay = trip.daysOfWeek && trip.daysOfWeek.map((d: string) => d.toLowerCase()).includes(filterDay);
      const arrivalDate = trip.estimatedarrival ? new Date(trip.estimatedarrival) : null;
      const tripTime = arrivalDate ? arrivalDate.toLocaleTimeString() : '';
      const matchesTime = !filters.time || tripTime.includes(filters.time);
      const matchesStatus = filters.status === 'all' || trip.status === filters.status;
      const matchesRoute = !filters.route || filters.route === 'all' || routeString.includes(filters.route.toLowerCase());
      return matchesSearch && matchesDay && matchesTime && matchesStatus && matchesRoute;
    });
  }, [activeTrips, searchTerm, filters]);

  const uniqueRoutes = React.useMemo(() => {
    const routes = new Set<string>();
    activeTrips.forEach(trip => {
      routes.add(`${trip.departure} → ${trip.destination}`);
    });
    return Array.from(routes);
  }, [activeTrips]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // --- Conditional Rendering Test ---
  // If not loading, no error, and no trips, show a specific message and background
  if (!isLoading && !error && activeTrips.length === 0) {
     return (
       <div className="min-h-screen bg-yellow-200 flex items-center justify-center">
         <div className="text-center">
           <h1 className="text-2xl font-bold text-gray-800 mb-4">No Active Trips Found</h1>
           {debugInfo && (
             <div className="mt-4 p-4 bg-yellow-100 rounded-lg text-left">
               <pre className="text-xs text-gray-700">{JSON.stringify(debugInfo, null, 2)}</pre>
             </div>
           )}
         </div>
       </div>
     );
   }


  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">Loading schedule data...</div>
        {debugInfo && ( // Show debug info while loading
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Error loading schedule data.
        {debugInfo && ( // Show debug info on error
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  // --- Original rendering logic starts here ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-2 mb-2">
          <Calendar className="h-7 w-7 text-indigo-500" /> Schedule Management
        </h1>
        <p className="text-muted-foreground">View and manage all scheduled trips</p>
      </div>
      <div className="p-8">
        {/* ... rest of your existing JSX ... */}
        <h1 className="text-3xl font-extrabold mb-8 text-blue-900">Schedule Management</h1>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2"
            >
              <Filter size={20} />
              Filters
              <ChevronDown size={16} className={`transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="bg-card border rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={filters.time}
                    onChange={(e) => setFilters(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Route</Label>
                  <Select
                    value={filters.route}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, route: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Routes</SelectItem>
                      {uniqueRoutes.map(route => (
                        <SelectItem key={route} value={route}>{route}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as FilterState['sortBy'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="departuretime">Departure Time</SelectItem>
                      <SelectItem value="route">Route</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="seats">Seat Availability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setFilters({ date: '', time: '', status: 'all', route: '', sortBy: 'departuretime' })}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Trips List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold mb-6 text-blue-800">Active Trips</h2>
            {/* Modified conditional rendering */}
            {filteredTrips.length === 0 ? (
              // This message will show if filteredTrips is empty, even if activeTrips has data
              <div className="text-center py-8 text-muted-foreground">
                {activeTrips.length === 0 ? "No active trips found" : "No trips match your filters"}
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`
                    p-6 rounded-2xl border shadow-sm cursor-pointer transition-all duration-200 bg-white
                    ${selectedTrip?.id === trip.id
                      ? 'border-2 border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:shadow-md hover:border-blue-300'
                    }
                    ${trip.status === 'active' ? '!border-green-500' : '!border-gray-300'}
                  `}
                  style={{ minWidth: 0 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span className="font-bold text-lg text-gray-900">{trip.departure} <span className="text-gray-400">→</span> {trip.destination}</span>
                    {trip.plateNumber && (
                      <span className="ml-2 text-xs text-muted-foreground">({trip.plateNumber})</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 items-center text-sm text-gray-700 mb-2 mt-2">
                    <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                      <Clock className="h-4 w-4 text-blue-500" />
                      {trip.departuretime ? trip.departuretime.slice(0, 5) : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                      <Users className="h-4 w-4 text-gray-500" />
                      {trip.bookedSeats}/{trip.totalSeats} seats
                    </span>
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                      K{Number(trip.fare).toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date().toLocaleDateString()}
                    </span>
                    <span className="ml-auto">{getStatusBadge(trip.status)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Seat Management */}
          <div className="lg:col-span-2">
            {selectedTrip ? (
              <div className="bg-white rounded-2xl border shadow-lg p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">
                    {selectedTrip.departure} → {selectedTrip.destination}
                  </h2>
                  <p className="text-muted-foreground">
                    Departure: {selectedTrip.departuretime
                      ? selectedTrip.departuretime.slice(0, 5)
                      : 'N/A'}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Seat Map</h3>
                  {seatsLoading ? (
                    <div className="text-center py-4 text-muted-foreground">Loading seats...</div>
                  ) : tripSeats && tripSeats.length > 0 ? (
                    <div className="grid grid-cols-4 gap-4">
                      {tripSeats.map((seat) => (
                        <div
                          key={seat.number}
                          className={`
                            p-4 rounded-lg border-2 text-center cursor-pointer
                            ${seat.status === 'available'
                              ? 'border-green-500 hover:border-green-700'
                              : seat.status === 'booked'
                              ? 'border-red-500 bg-red-100 text-red-700'
                              : 'border-muted-foreground bg-muted text-muted-foreground'
                            }
                          `}
                          onClick={() => {
                            if (seat.status === 'available') {
                              setBookingSeat(seat);
                              setShowBookingModal(true);
                            }
                          }}
                        >
                          <div className="font-medium">Seat {seat.number}</div>
                          <div className="text-sm capitalize">
                            {seat.status}
                          </div>
                          {seat.passengerName && (
                            <div className="text-sm mt-1">{seat.passengerName}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No seat data available for this trip.
                    </div>
                  )}
                </div>

                {/* Quick Actions section removed as per request */}
              </div>
            ) : (
              <div className="bg-muted rounded-lg border border-border p-8 text-center">
                <p className="text-muted-foreground">Select a trip to manage seats</p>
              </div>
            )}
          </div>
        </div>

        {/* Seat Booking Modal */}
        {showBookingModal && bookingSeat && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Book Seat {bookingSeat.number}</h3>
              {selectedTrip && selectedTrip.estimatedarrival && new Date(selectedTrip.estimatedarrival) < new Date() ? (
                <div className="text-red-600 font-semibold text-center">Booking not allowed for past trips.</div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!selectedTrip || !bookingSeat) return;
                    setBookingLoading(true);
                    try {
                      await reserveSeatMutation.mutateAsync({
                        routeId: selectedTrip.id,
                        seatData: {
                          seatNumber: bookingSeat.number,
                          customerName: bookingForm.customerName,
                          customerPhone: bookingForm.customerPhone,
                          customerEmail: bookingForm.customerEmail,
                          amount: selectedTrip.fare || 0,
                          travelDate: filters.date || new Date().toISOString().slice(0, 10),
                        },
                      });
                      setShowBookingModal(false);
                      setBookingForm({ customerName: '', customerPhone: '', customerEmail: '' });
                    } catch (err) {
                      // Error handled by mutation
                    } finally {
                      setBookingLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={bookingForm.customerName}
                      onChange={e => setBookingForm(f => ({ ...f, customerName: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="text"
                      value={bookingForm.customerPhone}
                      onChange={e => setBookingForm(f => ({ ...f, customerPhone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email (optional)</label>
                    <input
                      type="email"
                      value={bookingForm.customerEmail}
                      onChange={e => setBookingForm(f => ({ ...f, customerEmail: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      disabled={bookingLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? 'Booking...' : 'Book Seat'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}