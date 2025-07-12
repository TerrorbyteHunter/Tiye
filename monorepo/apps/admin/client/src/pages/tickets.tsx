import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketList } from "@/components/tickets/ticket-list";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Ticket as TicketIcon, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import type { Vendor, Route, Ticket } from "@shared/schema";
import { useAuth } from "@/lib/auth";

export default function Tickets() {
  const { user } = useAuth();
  const [selectedVendor, setSelectedVendor] = useState<string | undefined>(undefined);
  const [selectedRoute, setSelectedRoute] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("all");

  // Set vendor ID from auth token if user is a vendor
  useEffect(() => {
    if (user && 'role' in user && user.role === 'vendor') {
      setSelectedVendor(user.id.toString());
    }
  }, [user]);

  // Fetch vendors for the filter (only if user is admin)
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
    enabled: !!(user && 'role' in user && user.role === 'admin'), // Only fetch vendors if user is admin
  });

  // Fetch routes for the selected vendor
  const { data: routes = [], isLoading: routesLoading } = useQuery<Route[]>({
    queryKey: selectedVendor ? ['/api/vendor/routes', { vendorId: selectedVendor }] : [],
    enabled: !!selectedVendor,
  });

  // Fetch tickets with optional vendor and route filter
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: [
      '/api/tickets',
      {
        vendorId: selectedVendor,
        routeId:
          selectedRoute && selectedRoute !== 'all' && !isNaN(Number(selectedRoute))
            ? Number(selectedRoute)
            : undefined,
      },
    ],
    enabled: true,
  });

  // Handle vendor selection (only for admin users)
  const handleVendorChange = (value: string) => {
    if (user && 'role' in user && user.role === 'admin') {
      setSelectedVendor(value === "all" ? undefined : value);
      setSelectedRoute(undefined); // Reset route when vendor changes
    }
  };

  // Handle route selection
  const handleRouteChange = (value: string) => {
    setSelectedRoute(value === "all" ? undefined : value);
  };

  // Calculate ticket statistics
  const totalTickets = tickets.length;
  const paidTickets = tickets.filter(t => t.status === 'confirmed').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const cancelledTickets = tickets.filter(t => t.status === 'cancelled' || t.status === 'refunded').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl mb-8 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <TicketIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Ticket Management</h1>
              <p className="text-orange-100">Monitor and manage all ticket transactions</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="hidden md:block w-1 h-12 bg-white/30 rounded-full"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalTickets}</div>
                  <div className="text-xs text-orange-200">Total Tickets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{paidTickets}</div>
                  <div className="text-xs text-orange-200">Paid</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{pendingTickets}</div>
                  <div className="text-xs text-orange-200">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{cancelledTickets}</div>
                  <div className="text-xs text-orange-200">Cancelled</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Ticket
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
              <Clock className="h-5 w-5 text-blue-600" />
              Filter Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {user && 'role' in user && user.role === 'admin' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Vendor</label>
                  <Select value={selectedVendor || "all"} onValueChange={handleVendorChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Vendors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vendors</SelectItem>
                      {vendorsLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Route</label>
                <Select
                  disabled={!selectedVendor || routesLoading}
                  value={selectedRoute || "all"}
                  onValueChange={handleRouteChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Routes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Routes</SelectItem>
                    {routesLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      routes.map((route) => (
                        <SelectItem key={route.id} value={route.id.toString()}>
                          {route.departure} → {route.destination}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardContent className="p-6">
            <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  All Tickets
                </TabsTrigger>
                <TabsTrigger value="paid" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Paid
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Pending
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelled
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4">
                {ticketsLoading ? (
                  <div className="space-y-2">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <TicketList tickets={tickets} />
                )}
              </TabsContent>

              <TabsContent value="paid" className="space-y-4 mt-4">
                {ticketsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <TicketList tickets={tickets.filter((ticket) => ticket.status === 'confirmed')} />
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {ticketsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <TicketList tickets={tickets.filter((ticket) => ticket.status === 'pending')} />
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-4 mt-4">
                {ticketsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <TicketList tickets={tickets.filter((ticket) => ticket.status === 'cancelled' || ticket.status === 'refunded')} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}