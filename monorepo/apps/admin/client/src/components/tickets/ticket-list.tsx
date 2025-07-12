import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { MoreHorizontal, CalendarDays, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Ticket } from "@shared/schema";
import { apiRequest, apiRequestWithSnakeCase, API } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, RotateCcw, AlertCircle, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DateFilter = "all" | "today" | "tomorrow" | "week" | "custom";
type StatusFilter = "all" | "confirmed" | "pending" | "refunded" | "cancelled";

interface TicketListProps {
  tickets?: Ticket[];
  vendorId?: number;
  routeId?: number;
}

const StatusBadge = ({ status }: { status: Ticket["status"] }) => {
  switch (status) {
    case "confirmed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" /> Confirmed
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    case "refunded":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <RotateCcw className="mr-1 h-3 w-3" /> Refunded
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          <AlertCircle className="mr-1 h-3 w-3" /> Cancelled
        </Badge>
      );
    default:
      return null;
  }
};

export function TicketList({ tickets: propTickets, vendorId, routeId }: TicketListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [updateStatusTicket, setUpdateStatusTicket] = useState<Ticket | null>(null);
  const [newStatus, setNewStatus] = useState<Ticket["status"]>("confirmed");
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [customDate, setCustomDate] = useState<Date | null>(null);

  // Build query key and params if we need to fetch tickets
  let apiUrl = '/api/tickets';
  let queryParams = '';

  if (vendorId) {
    queryParams += `vendorId=${vendorId}`;
  }

  if (routeId) {
    if (queryParams) queryParams += '&';
    queryParams += `routeId=${routeId}`;
  }

  if (dateFilter !== 'all') {
    if (queryParams) queryParams += '&';
    queryParams += `dateFilter=${dateFilter}`;
  }

  if (queryParams) {
    apiUrl += `?${queryParams}`;
  }

  // Only fetch if tickets weren't provided as props
  const { data: fetchedTickets = [], isLoading } = useQuery({
    queryKey: [apiUrl, customDate?.toISOString()],
    enabled: !propTickets, // Only run the query if tickets weren't provided as props
  });

  // Use provided tickets or fetched tickets
  let tickets: Ticket[] = propTickets || (fetchedTickets as Ticket[]);

  // Debug tickets data
  console.log('DEBUG tickets data:', tickets);

  // If custom date is selected, filter tickets by that date (ignoring time)
  if (dateFilter === 'custom' && customDate) {
    const customDateStr = customDate.toISOString().slice(0, 10);
    tickets = tickets.filter(ticket => {
      if (!ticket.travelDate) return false;
      const ticketDate = new Date(ticket.travelDate).toISOString().slice(0, 10);
      return ticketDate === customDateStr;
    });
  }

  // Build query key and params for routes
  let routesApiUrl = '/api/routes/with-reservations';
  let routesQueryParams = '';

  if (dateFilter !== 'all') {
    routesQueryParams += `dateFilter=${dateFilter}`;
  }

  if (routesQueryParams) {
    routesApiUrl += `?${routesQueryParams}`;
  }

  const { data: routes = [] } = useQuery<any[]>({
    queryKey: [routesApiUrl],
  });

  // Debug routes data
  console.log('DEBUG routes data:', routes);

  const { data: vendors = [] } = useQuery<any[]>({
    queryKey: ['/api/vendors'],
  });

  const getRouteName = (routeId: number) => {
    const route = routes.find((r: any) => r.id === routeId);
    return route ? `${route.departure} → ${route.destination}` : `Route #${routeId}`;
  };

  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find((v: any) => v.id === vendorId);
    return vendor ? vendor.name : `Vendor #${vendorId}`;
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Invalid Date';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid Date';
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      console.error('Error parsing or formatting date:', dateString, e);
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return 'Invalid Date/Time';
    
    try {
      // First try parsing as ISO string
      let date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'MMM dd, yyyy HH:mm');
      }
      
      // If that fails, try creating a new Date object
      date = new Date(dateString);
      if (isValid(date)) {
        return format(date, 'MMM dd, yyyy HH:mm');
      }
      
      // If it's just a time string (HH:mm), combine with today's date
      if (/^\d{2}:\d{2}$/.test(dateString)) {
        const today = new Date();
        const [hours, minutes] = dateString.split(':').map(Number);
        today.setHours(hours, minutes, 0, 0);
        return format(today, 'MMM dd, yyyy HH:mm');
      }
      
      console.error('Unable to parse date/time:', dateString);
      return 'Invalid Date/Time';
    } catch (e) {
      console.error('Error parsing or formatting date/time:', dateString, e);
      return 'Invalid Date/Time';
    }
  };

  // Helper to combine travelDate and route departureTime
  const getTravelDateTime = (ticket: any) => {
    const route = routes.find((r: any) => r.id === ticket.routeId);
    console.log('DEBUG getTravelDateTime:', { 
      ticketId: ticket.id, 
      ticketRouteId: ticket.routeId,
      travelDate: ticket.travelDate, 
      route: route,
      departureTime: route?.departureTime,
      allRoutes: routes.map(r => ({ id: r.id, departureTime: r.departureTime }))
    });
    
    if (route && ticket.travelDate && route.departureTime) {
      const datePart = ticket.travelDate.split('T')[0];
      const timePart = route.departureTime;
      const dateTimeString = `${datePart}T${timePart}`;
      console.log('DEBUG combining:', { datePart, timePart, dateTimeString });
      return formatDateTime(dateTimeString);
    }
    console.log('DEBUG fallback to ticket.travelDate only');
    return formatDateTime(ticket.travelDate);
  };

  const filteredTickets: Ticket[] = tickets
    .filter((ticket: Ticket) => {
      const matchesSearch =
        (ticket.bookingReference?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ticket.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ticket.customerPhone?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

      // Apply date filtering on frontend as well (in case backend filtering doesn't work)
      let matchesDate = true;
      if (dateFilter !== 'all' && ticket.travelDate) {
        const travelDate = new Date(ticket.travelDate as unknown as string);
        if (!isNaN(travelDate.getTime())) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);

          switch (dateFilter) {
            case 'today':
              matchesDate = travelDate >= today && travelDate < tomorrow;
              break;
            case 'tomorrow':
              const dayAfterTomorrow = new Date(tomorrow);
              dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
              matchesDate = travelDate >= tomorrow && travelDate < dayAfterTomorrow;
              break;
            case 'week':
              matchesDate = travelDate >= today && travelDate < nextWeek;
              break;
            default:
              matchesDate = true;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

  // Sort tickets by createdAt descending (latest first)
  const sortedTickets = filteredTickets.slice().sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  const updateTicketStatus = async () => {
    if (!updateStatusTicket) return;

    try {
      const response = await apiRequest(
        `/api/tickets/${updateStatusTicket.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const updatedTicket = await (response as any).json();

      toast({
        title: "Ticket status updated",
        description: `Ticket #${updatedTicket.bookingReference} is now ${updatedTicket.status}`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setUpdateStatusTicket(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Book ticket mutation
  const bookTicketMutation = useMutation({
    mutationFn: (data: any) => apiRequestWithSnakeCase(API.walkInTicket, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      // Invalidate both tickets and routes queries
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/routes/with-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: 'Ticket booked successfully',
        description: 'The ticket was booked successfully.',
      });
      setSelectedRoute(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to book ticket',
        variant: 'destructive',
      });
    },
  });

  // PATCH: Walk-in ticket modal form submission logic
  const handleWalkInSubmit = (formData: any, selectedRoute: any) => {
    // Always send travelDate from the selected route
    const travelDate = selectedRoute && selectedRoute.departureTime;
    const payload = {
      ...formData,
      travelDate,
    };
    console.log('handleWalkInSubmit payload:', payload, 'selectedRoute:', selectedRoute);
    bookTicketMutation.mutate(payload);
  };

  // Handle ticket booking
  const handleBookTicket = async (route: any) => {
    try {
      // Find first available seat
      const availableSeat = route.seats.find((seat: any) => seat.status === 'available');
      if (!availableSeat) {
        toast({
          title: 'No seats available',
          description: 'There are no available seats for this route.',
          variant: 'destructive',
        });
        return;
      }

      // Set the selected route to open the booking form
      setSelectedRoute(route);
    } catch (error) {
      console.error('Error preparing ticket booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to prepare ticket booking',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tickets</h2>
        <div className="flex gap-4">
          <Select
            value={dateFilter}
            onValueChange={(value: DateFilter) => setDateFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">Next 7 Days</SelectItem>
                <SelectItem value="custom">Custom Date...</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {dateFilter === 'custom' && (
            <div className="flex items-center">
              <Calendar
                mode="single"
                selected={customDate || undefined}
                onSelect={(date) => setCustomDate(date || null)}
                className="border rounded-md shadow-sm"
              />
            </div>
          )}
          <Select
            value={statusFilter}
            onValueChange={(value: StatusFilter) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[200px]"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Departure Time</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>Available Seats</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes?.map((route: any) => (
                <TableRow key={route.id}>
                  <TableCell>
                    {route.departure} → {route.destination}
                  </TableCell>
                  <TableCell>{formatDateTime(route.departureTime)}</TableCell>
                  <TableCell>{route.plateNumber || 'Not Assigned'}</TableCell>
                  <TableCell>
                    {route.capacity - (route.bookedSeats || 0)} / {route.capacity}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleBookTicket(route)}
                      disabled={bookTicketMutation.isPending && selectedRoute?.id === route.id}
                    >
                      {bookTicketMutation.isPending && selectedRoute?.id === route.id
                        ? 'Booking...'
                        : 'Quick Book Seat'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Seat</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTickets?.map((ticket: any) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.bookingReference || ticket.id}</TableCell>
                  <TableCell>
                    <div>{ticket.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {ticket.customerPhone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRouteName(ticket.routeId)}
                  </TableCell>
                  <TableCell>{ticket.seatNumber}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 text-sm cursor-help">
                            <CalendarDays className="h-3 w-3 text-muted-foreground" />
                            <span>Purchase: {formatDateTime(ticket.createdAt)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>When this ticket was purchased</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 text-sm cursor-help mt-1">
                            <RotateCcw className="h-3 w-3 text-blue-600" />
                            <span>Travel: {getTravelDateTime(ticket)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>When this trip is scheduled to depart</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ticket.status === 'confirmed' ? 'default' : 'secondary'}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>K{ticket.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}