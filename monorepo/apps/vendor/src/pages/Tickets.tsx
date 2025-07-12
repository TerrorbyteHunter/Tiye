import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routes, tickets } from '../lib/api';
import { Calendar, Clock, MapPin, DollarSign, User, Phone, Mail, Search, Filter, CheckCircle, XCircle, Users, Ticket as TicketIcon, Eye, ReceiptText, History as HistoryIcon, Plus } from 'lucide-react';
import TicketReceipt from '../components/TicketReceipt';
import { EmptyState } from '../../../../packages/ui/src/components/EmptyState';

interface WalkInTicketForm {
  routeId: number;
  passengerName: string;
  phone: string;
  email: string;
  seatNumber: number;
  amount: number;
}

interface Route {
  id: number;
  departure: string;
  destination: string;
  departureTime: string;
  fare: number;
  availableSeats: number;
  bookedSeats: number;
  totalSeats: number;
  status: 'active' | 'cancelled' | 'completed';
  seats: Array<{
    number: number;
    status: 'available' | 'booked' | 'reserved';
    passengerName?: string;
  }>;
}

interface Ticket {
  id: number;
  routeId: number;
  passengerName: string;
  phone: string;
  email?: string;
  seatNumber: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  amount: number;
  createdAt: string;
  route: Route;
  bookingSource: string;
}

// Helper to map ticket from backend to frontend structure
function mapTicketFromBackend(ticket: any) {
  // Debug log to inspect the route object
  console.log('Ticket route object:', ticket.route);
  return {
    ...ticket,
    passengerName: ticket.customer_name,
    customerName: ticket.customer_name,
    phone: ticket.customer_phone,
    email: ticket.customer_email,
    seatNumber: ticket.seat_number,
    amount: Number(ticket.amount),
    createdAt: ticket.created_at,
    route: ticket.route
      ? {
          ...ticket.route,
          departureTime:
            ticket.route.departureTime ||
            ticket.route.departuretime ||
            ticket.route.departure_time ||
            ticket.departureTime ||
            ticket.departuretime ||
            ticket.departure_time ||
            '',
          // ...other fields
        }
      : {
          departure: ticket.departure,
          destination: ticket.destination,
          departureTime: ticket.departureTime || ticket.departuretime || ticket.departure_time || '',
          fare: ticket.fare || 0,
        }
  };
}

// Helper to map route from backend to frontend structure
function mapRouteFromBackend(route: any) {
  return {
    ...route,
    departureTime: route.departure_time,
    // add other mappings if needed
  };
}

export default function Tickets() {
  const queryClient = useQueryClient();
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const [selectedRoute, setSelectedRoute] = React.useState<Route | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [showHistory, setShowHistory] = React.useState(false);
  const [formData, setFormData] = React.useState<WalkInTicketForm>({
    routeId: 0,
    passengerName: '',
    phone: '',
    email: '',
    seatNumber: 0,
    amount: 0,
  });
  const [routeSearchTerm, setRouteSearchTerm] = React.useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = React.useState('all');
  const [bookingStep, setBookingStep] = React.useState(1); // 1: Route Selection, 2: Passenger Details
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [lastBookedTicket, setLastBookedTicket] = React.useState<Ticket | null>(null);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);

  const { data: activeRoutes = [], isLoading: routesLoading, error: routesError } = useQuery<Route[]>({
    queryKey: ['active-routes'],
    queryFn: async () => {
      try {
        const response = await routes.getWithReservations();
        console.log('Active routes:', response);
        return response.map(mapRouteFromBackend);
      } catch (error) {
        console.error('Error fetching active routes:', error);
        throw error;
      }
    },
    retry: 1,
  });

  const { data: allTickets = [], isLoading: ticketsLoading, error: ticketsError } = useQuery<Ticket[]>({
    queryKey: ['tickets'],
    queryFn: async () => {
      try {
        const response = await tickets.getAll();
        console.log('All tickets:', response);
        return response.map(mapTicketFromBackend);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }
    },
    retry: 1,
  });

  const { data: routeSeats = [], isLoading: seatsLoading } = useQuery({
    queryKey: ['route-seats', selectedRoute?.id],
    queryFn: async () => {
      if (!selectedRoute?.id) return [];
      try {
        const seats = await routes.getSeatReservations(selectedRoute.id);
        console.log('Fetched seats:', seats);
        if (selectedRoute) {
          setSelectedRoute(prev => prev ? { ...prev, seats } : null);
        }
        return seats;
      } catch (error) {
        console.error('Error fetching seats:', error);
        return [];
      }
    },
    enabled: !!selectedRoute?.id,
  });

  const { data: ticketHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['ticket-history'],
    queryFn: async () => {
      try {
        const response = await tickets.getHistory();
        // Filter to only show walk-in tickets
        const walkInTickets = response.filter((ticket: Ticket) => ticket.bookingSource === 'vendor');
        console.log('Walk-in ticket history:', walkInTickets);
        return walkInTickets.map(mapTicketFromBackend);
      } catch (error) {
        console.error('Error fetching ticket history:', error);
        throw error;
      }
    },
    enabled: showHistory,
  });

  const createTicketMutation = useMutation({
    mutationFn: (ticketData: WalkInTicketForm) => tickets.createWalkIn(ticketData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['route-seats'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      
      // Ensure we have the complete ticket data with route information
      if (data && selectedRoute) {
        const ticketWithRoute = {
          ...data,
          route: {
            departure: selectedRoute.departure,
            destination: selectedRoute.destination,
            departureTime: selectedRoute.departureTime,
            fare: selectedRoute.fare
          }
        };
        console.log('Setting ticket data for receipt:', ticketWithRoute);
        setLastBookedTicket(ticketWithRoute);
        setShowReceipt(true);
      } else {
        console.error('Missing ticket or route data:', { data, selectedRoute });
      }
      
      setIsBookingOpen(false);
      setFormData({
        routeId: 0,
        passengerName: '',
        phone: '',
        email: '',
        seatNumber: 0,
        amount: 0,
      });
    },
  });

  const updateTicketStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      tickets.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  const getAvailableSeats = (route: Route) => {
    if (!route) return [];
    
    console.log('Getting available seats for route:', route);
    console.log('Route seats:', route.seats);
    console.log('RouteSeats from query:', routeSeats);
    
    // If seats array is not provided, generate seats based on availableSeats
    if (!route.seats) {
      console.log('No seats in route, generating based on availableSeats');
      const seats: Array<{
        number: number;
        status: 'available' | 'booked' | 'reserved';
        passengerName?: string;
      }> = [];
      for (let i = 1; i <= route.totalSeats; i++) {
        if (seats.length < route.availableSeats) {
          seats.push({
            number: i,
            status: 'available',
            passengerName: undefined
          });
        }
      }
      console.log('Generated seats:', seats);
      return seats;
    }

    // If seats array is provided, use it
    const availableSeats = route.seats
      .filter(seat => seat.status === 'available')
      .sort((a, b) => a.number - b.number);

    console.log('Available seats from route:', availableSeats);
    return availableSeats;
  };

  const handleRouteSelect = (route: Route) => {
    console.log('Selected route:', route);
    const routeWithSeats = { ...route };
    
    // Use the existing routeSeats data from the query
    if (routeSeats && routeSeats.length > 0) {
      console.log('Using routeSeats from query:', routeSeats);
      routeWithSeats.seats = routeSeats;
    } else {
      console.log('No routeSeats from query, generating seats');
      // Generate seats if API data is not available
      const generatedSeats: Array<{
        number: number;
        status: 'available' | 'booked' | 'reserved';
        passengerName?: string;
      }> = Array.from({ length: route.totalSeats }, (_, i) => ({
        number: i + 1,
        status: i < route.availableSeats ? 'available' : 'booked',
        passengerName: undefined
      }));
      routeWithSeats.seats = generatedSeats;
      console.log('Generated seats:', generatedSeats);
    }

    setSelectedRoute(routeWithSeats);
    setFormData(prev => ({
      ...prev,
      routeId: route.id,
      seatNumber: 0,
      amount: route.fare
    }));
    setBookingStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) {
      console.error('No route selected');
      return;
    }
    console.log('Submitting form data:', formData);
    createTicketMutation.mutate({
      ...formData,
      amount: selectedRoute.fare
    });
  };

  const filteredTickets = React.useMemo(() => {
    return allTickets.filter(ticket => {
      const matchesSearch = 
        (ticket.passengerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ticket.phone || '').includes(searchTerm) ||
        (ticket.route ? `${ticket.route.departure} → ${ticket.route.destination}` : '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      
      // Apply time filter to tickets based on travel date
      let matchesTimeFilter = true;
      if (selectedTimeFilter !== 'all' && ticket.route && ticket.route.departureTime) {
        const travelDate = new Date(ticket.route.departureTime);
        const now = new Date();
        
        switch (selectedTimeFilter) {
          case 'today':
            matchesTimeFilter = travelDate.toDateString() === now.toDateString();
            break;
          case 'tomorrow':
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            matchesTimeFilter = travelDate.toDateString() === tomorrow.toDateString();
            break;
          case 'week':
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            matchesTimeFilter = travelDate >= now && travelDate <= nextWeek;
            break;
          default:
            matchesTimeFilter = true;
        }
      }
      
      return matchesSearch && matchesStatus && matchesTimeFilter;
    });
  }, [allTickets, searchTerm, statusFilter, selectedTimeFilter]);

  const filteredRoutes = React.useMemo(() => {
    return activeRoutes
      .map(mapRouteFromBackend)
      .filter(route => {
        const matchesSearch = 
          route.departure.toLowerCase().includes(routeSearchTerm.toLowerCase()) ||
          route.destination.toLowerCase().includes(routeSearchTerm.toLowerCase());

        if (selectedTimeFilter === 'all') return matchesSearch;

        const routeTime = new Date(route.departureTime);
        const now = new Date();
        
        switch (selectedTimeFilter) {
          case 'today':
            return matchesSearch && 
              routeTime.toDateString() === now.toDateString();
          case 'tomorrow':
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return matchesSearch && 
              routeTime.toDateString() === tomorrow.toDateString();
          case 'week':
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return matchesSearch && 
              routeTime >= now && routeTime <= nextWeek;
          default:
            return matchesSearch;
        }
      });
  }, [activeRoutes, routeSearchTerm, selectedTimeFilter]);

  const handleBack = () => {
    if (bookingStep === 2) {
      setBookingStep(1);
      setSelectedRoute(null);
    } else {
      setIsBookingOpen(false);
      setSelectedRoute(null);
      setBookingStep(1);
    }
  };

  if (ticketsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2 mb-2">
            <TicketIcon className="h-7 w-7 text-indigo-500" /> Tickets Management
          </h1>
          <p className="text-muted-foreground">Manage, book, and view all tickets</p>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tickets Management</h1>
          <button
            onClick={() => setIsBookingOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Book Walk-in Ticket
          </button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (ticketsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2 mb-2">
            <TicketIcon className="h-7 w-7 text-indigo-500" /> Tickets Management
          </h1>
          <p className="text-muted-foreground">Manage, book, and view all tickets</p>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tickets Management</h1>
          <button
            onClick={() => setIsBookingOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Book Walk-in Ticket
          </button>
        </div>
        <div className="text-center py-8 text-red-600">
          Error loading tickets: {(ticketsError as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-2 mb-2">
          <TicketIcon className="h-7 w-7 text-indigo-500" /> Tickets Management
        </h1>
        <p className="text-muted-foreground">Manage, book, and view all tickets</p>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tickets Management</h1>
          <div className="space-x-4 flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-indigo-200 text-indigo-700 font-semibold shadow hover:bg-indigo-50 transition"
            >
              <HistoryIcon className="w-4 h-4" />
              {showHistory ? 'Current Tickets' : 'Walk-in History'}
            </button>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-lg hover:from-indigo-600 hover:to-blue-600 transition"
            >
              <Plus className="w-4 h-4" /> Book New Ticket
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex gap-4 items-center flex-wrap">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white/80 border border-indigo-200 focus:ring-2 focus:ring-indigo-400 shadow"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedTimeFilter}
              onChange={(e) => setSelectedTimeFilter(e.target.value)}
              className="px-4 py-2 rounded-full bg-white/80 border border-indigo-200 focus:ring-2 focus:ring-indigo-400 shadow"
            >
              <option value="all">All Times</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">Next 7 Days</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-full bg-white/80 border border-indigo-200 focus:ring-2 focus:ring-indigo-400 shadow"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        {showHistory ? (
          <div className="glass bg-white/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2"><HistoryIcon className="w-5 h-5 text-indigo-400" /> Walk-in Booking History</h3>
              <span className="text-sm text-gray-500">Showing tickets booked at vendor office</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-indigo-100">
                <thead className="bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Ticket ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Passenger</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-indigo-50">
                  {historyLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">Loading history...</td>
                    </tr>
                  ) : ticketHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">No booking history found</td>
                    </tr>
                  ) : (
                    ticketHistory.map((ticket: Ticket) => (
                      <tr key={ticket.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{ticket.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{ticket.route.departure} to {ticket.route.destination}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{ticket.passengerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shadow
                            ${ticket.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              ticket.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'}`}
                          >
                            {ticket.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                            {ticket.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                            {ticket.status === 'pending' && <Clock className="w-3 h-3" />}
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow">
                            K{ticket.amount}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTickets.length === 0 ? (
              <EmptyState
                title="No tickets found"
                description="There are no tickets to display yet."
                icon={<TicketIcon className="w-12 h-12" />}
              />
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`glass bg-white/80 rounded-2xl shadow-xl border-l-8 p-6 mb-6 flex flex-col gap-4 hover:shadow-2xl transition-shadow duration-200
                    ${ticket.status === 'confirmed' ? 'border-green-400' : ticket.status === 'pending' ? 'border-yellow-400' : 'border-red-400'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-6 h-6 text-blue-500" />
                    <span className="font-bold text-lg text-indigo-900">{ticket.passengerName}</span>
                    <span className="ml-auto inline-block px-4 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow">
                      K{Number(ticket.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 items-center text-sm text-gray-700 mb-2 mt-2">
                    <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      {ticket.route?.departure} <span className="text-gray-400">→</span> {ticket.route?.destination}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {ticket.route?.departureTime && ticket.route.departureTime !== '' ? ticket.route.departureTime.slice(0, 5) : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                      <Users className="w-4 h-4 text-gray-500" />
                      Seat {ticket.seatNumber}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shadow
                      ${ticket.status === 'confirmed' ? 'bg-green-100 text-green-700' : ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {ticket.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                      {ticket.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                      {ticket.status === 'pending' && <Clock className="w-3 h-3" />}
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-lg hover:from-indigo-600 hover:to-blue-600 transition">
                      <Eye className="w-4 h-4" /> View
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-indigo-200 text-indigo-700 font-semibold shadow hover:bg-indigo-50 transition"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <ReceiptText className="w-4 h-4" /> Receipt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Walk-in Booking Modal */}
        {isBookingOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Book Walk-in Ticket</h2>
                <button
                  onClick={handleBack}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
              </div>
              
              {/* Route Selection - Step 1 */}
              {bookingStep === 1 && (
                <div>
                  <div className="mb-6 space-y-4">
                    {/* Search and Time Filter */}
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="Search routes by departure or destination..."
                          value={routeSearchTerm}
                          onChange={(e) => setRouteSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                      </div>
                      <select
                        value={selectedTimeFilter}
                        onChange={(e) => setSelectedTimeFilter(e.target.value)}
                        className="border rounded-lg px-4 py-2"
                      >
                        <option value="all">All Times</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="week">Next 7 Days</option>
                      </select>
                    </div>
                  </div>

                  {routesLoading ? (
                    <div className="text-center py-4">Loading routes...</div>
                  ) : routesError ? (
                    <div className="text-center py-4 text-red-600">
                      Error loading routes: {(routesError as Error).message}
                    </div>
                  ) : filteredRoutes.length === 0 ? (
                    <EmptyState
                      title="No routes found"
                      description="No routes are available for this ticket."
                      icon={<TicketIcon className="w-12 h-12" />}
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-4 mb-4 max-h-[60vh] overflow-y-auto">
                      {filteredRoutes.map((route) => (
                        <div
                          key={route.id}
                          onClick={() => handleRouteSelect(route)}
                          className="p-4 border rounded-lg cursor-pointer hover:border-blue-500"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">{route.departure} → {route.destination}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{selectedRoute?.departureTime && !isNaN(new Date(route.departureTime).getTime())
                                ? new Date(route.departureTime).toLocaleTimeString()
                                : 'Invalid Date'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{selectedRoute?.departureTime && !isNaN(new Date(route.departureTime).getTime())
                                ? new Date(route.departureTime).toLocaleDateString()
                                : 'Invalid Date'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>ZMW {route.fare}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{route.availableSeats} seats available</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Passenger Details - Step 2 */}
              {bookingStep === 2 && selectedRoute && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Selected Route</h3>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">{selectedRoute.departure} → {selectedRoute.destination}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{selectedRoute?.departureTime && !isNaN(new Date(selectedRoute.departureTime).getTime())
                            ? new Date(selectedRoute.departureTime).toLocaleTimeString()
                            : 'Invalid Date'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{selectedRoute?.departureTime && !isNaN(new Date(selectedRoute.departureTime).getTime())
                            ? new Date(selectedRoute.departureTime).toLocaleDateString()
                            : 'Invalid Date'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>ZMW {selectedRoute.fare}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{selectedRoute.availableSeats} seats available</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="passengerName" className="block text-sm font-medium mb-2">
                        Passenger Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          id="passengerName"
                          type="text"
                          value={formData.passengerName}
                          onChange={(e) => setFormData(prev => ({ ...prev, passengerName: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email (Optional)
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="seatNumber" className="block text-sm font-medium mb-2">
                        Seat Number
                      </label>
                      <select
                        id="seatNumber"
                        value={formData.seatNumber || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, seatNumber: Number(e.target.value) }))}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="">Select a seat</option>
                        {selectedRoute?.seats
                          ?.filter(seat => seat.status === 'available')
                          .sort((a, b) => a.number - b.number)
                          .map(seat => (
                            <option key={seat.number} value={seat.number}>
                              Seat {seat.number}
                            </option>
                          ))}
                      </select>
                      {(!selectedRoute?.seats || selectedRoute.seats.filter(seat => seat.status === 'available').length === 0) && (
                        <p className="text-sm text-red-600 mt-1">No seats available for this route</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={createTicketMutation.isPending || getAvailableSeats(selectedRoute).length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createTicketMutation.isPending ? 'Booking...' : 'Book Ticket'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && lastBookedTicket && (
          <TicketReceipt
            ticket={lastBookedTicket}
            onClose={() => setShowReceipt(false)}
          />
        )}

        {/* FAB for mobile quick action */}
        <button
          onClick={() => setIsBookingOpen(true)}
          className="fixed bottom-6 right-6 z-50 md:hidden flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-xl hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-300 animate-fab-pop"
          aria-label="Book New Ticket"
        >
          <Plus className="w-8 h-8" />
        </button>
        <style>{`
          @keyframes fab-pop {
            0% { transform: scale(0.8); opacity: 0; }
            80% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-fab-pop {
            animation: fab-pop 0.4s cubic-bezier(0.4,0,0.2,1) both;
          }
        `}</style>

        {selectedTicket && (
          <TicketReceipt
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </div>
    </div>
  );
} 