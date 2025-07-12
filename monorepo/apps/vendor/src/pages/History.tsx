import * as React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tickets } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { CalendarDays, Clock, Plane, History as HistoryIcon, Bus } from 'lucide-react';

export default function History() {
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [selectedView, setSelectedView] = useState("routes");

  // Fetch data based on selected view
  const { data: ticketHistory = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['ticket-history'],
    queryFn: () => tickets.getHistory(),
    enabled: selectedView === 'tickets'
  });

  const { data: routeHistory = [], isLoading: routesLoading } = useQuery({
    queryKey: ['route-history'],
    queryFn: () => tickets.getRouteHistory(),
    enabled: selectedView === 'routes'
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => tickets.getActivities(),
    enabled: selectedView === 'activities'
  });

  // Filter data based on date range
  const filterByDateRange = (data: any[], dateField: string) => {
    if (!dateRange.start && !dateRange.end) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      if (isNaN(itemDate.getTime())) return true; // Skip invalid dates
      
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      } else if (startDate) {
        return itemDate >= startDate;
      } else if (endDate) {
        return itemDate <= endDate;
      }
      
      return true;
    });
  };

  const filteredTicketHistory = filterByDateRange(ticketHistory, 'travel_date');
  const filteredRouteHistory = filterByDateRange(routeHistory, 'departure_time');
  const filteredActivities = filterByDateRange(activities, 'created_at');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "confirmed":
        return <Badge variant="default">Confirmed</Badge>;
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const isLoading = ticketsLoading || routesLoading || activitiesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-2 mb-2">
          <HistoryIcon className="h-7 w-7 text-indigo-500" /> History
        </h1>
        <p className="text-muted-foreground">View your past routes, tickets, and activities</p>
      </div>

      {/* Filters */}
      <Card className="glass shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Clock className="h-5 w-5 text-indigo-400" /> Filters
          </CardTitle>
          <CardDescription>Filter your history by date range and view type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="viewType">View Type</Label>
              <Select value={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400">
                  <SelectValue placeholder="Select view type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routes">Routes</SelectItem>
                  <SelectItem value="tickets">Tickets</SelectItem>
                  <SelectItem value="activities">Activities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="glass shadow-xl border-0">
          <CardContent className="p-8">
            <div className="text-center">Loading history data...</div>
          </CardContent>
        </Card>
      )}

      {/* Route History Table */}
      {selectedView === "routes" && !isLoading && (
        <Card className="glass shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Bus className="h-5 w-5 text-indigo-400" /> Route History
            </CardTitle>
            <CardDescription>View your completed routes and their performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100">
                  <TableHead>Route</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Tickets Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRouteHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No route history available.</TableCell>
                  </TableRow>
                ) : (
                  filteredRouteHistory.map((route: any) => (
                    <TableRow key={route.id} className="hover:bg-indigo-50/40 transition">
                      <TableCell>{route.departure} → {route.destination}</TableCell>
                      <TableCell>{formatDate(route.departure_time)}</TableCell>
                      <TableCell>{formatDateTime(route.departure_time)}</TableCell>
                      <TableCell>{route.tickets_sold || 0}</TableCell>
                      <TableCell className="text-green-700 font-semibold">K{Number(route.revenue || 0).toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(route.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Ticket History Table */}
      {selectedView === "tickets" && !isLoading && (
        <Card className="glass shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Plane className="h-5 w-5 text-indigo-400" /> Ticket History
            </CardTitle>
            <CardDescription>View all ticket transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100">
                  <TableHead>Ticket Number</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Travel Date</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTicketHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">No ticket history available.</TableCell>
                  </TableRow>
                ) : (
                  filteredTicketHistory.map((ticket: any) => (
                    <TableRow key={ticket.id} className="hover:bg-indigo-50/40 transition">
                      <TableCell>#{ticket.id}</TableCell>
                      <TableCell>{ticket.customer_name}</TableCell>
                      <TableCell>{ticket.departure} → {ticket.destination}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Plane className="h-3 w-3 text-blue-600" />
                          <span>{formatDate(ticket.travel_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-green-600" />
                          <span>{formatDate(ticket.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-green-700 font-semibold">ZMW {Number(ticket.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Activity Log */}
      {selectedView === "activities" && !isLoading && (
        <Card className="glass shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Plane className="h-5 w-5 text-indigo-400" /> Activity Log
            </CardTitle>
            <CardDescription>View system and user activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No activity log available.</TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity: any, index: number) => (
                    <TableRow key={index} className="hover:bg-indigo-50/40 transition">
                      <TableCell>{formatDateTime(activity.timestamp)}</TableCell>
                      <TableCell className="capitalize">{activity.action.replace('_', ' ')}</TableCell>
                      <TableCell>{activity.details}</TableCell>
                      <TableCell>{activity.user}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 