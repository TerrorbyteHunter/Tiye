/**
 * !IMPORTANT - DO NOT MODIFY THIS FILE
 * This file contains the final implementation of the Routes management page.
 * Any changes could break the existing functionality.
 * Last updated: March 29, 2024
 */

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routes } from '../lib/api';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Clock, Users, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';

interface RouteFormData {
  vendorId?: number;
  departure: string;
  destination: string;
  departureTime: string;
  estimatedArrival: string;
  fare: number;
  capacity: number;
  status: 'active' | 'inactive';
  daysOfWeek: string[];
  kilometers: number;
  stops: string[];
}

interface RouteApiData {
  vendorId?: number;
  departure: string;
  destination: string;
  departureTime: string;
  estimatedArrival: string;
  fare: number;
  capacity: number;
  status: 'active' | 'inactive';
  daysOfWeek: string[];
  kilometers: number;
  stops: string[];
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export default function Routes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddingRoute, setIsAddingRoute] = React.useState(false);
  const [editingRoute, setEditingRoute] = React.useState<number | null>(null);
  const [formData, setFormData] = React.useState<RouteFormData>({
    departure: '',
    destination: '',
    departureTime: '',
    estimatedArrival: '',
    fare: 0,
    capacity: 0,
    daysOfWeek: [],
    stops: [''],
    kilometers: 0,
    status: 'active'
  });

  const { data: routesList, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const data = await routes.getAll();
      // Map snake_case to camelCase for compatibility
      return data.map((route: any) => ({
        ...route,
        departureTime: route.departureTime || route.departure_time,
        estimatedArrival: route.estimatedArrival || route.estimated_arrival,
        daysOfWeek: route.daysOfWeek || route.days_of_week,
      }));
    }
  });

  const addRouteMutation = useMutation({
    mutationFn: (data: RouteFormData) => routes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setIsAddingRoute(false);
      setFormData({
        departure: '',
        destination: '',
        departureTime: '',
        estimatedArrival: '',
        fare: 0,
        capacity: 0,
        daysOfWeek: [],
        stops: [''],
        kilometers: 0,
        status: 'active'
      });
    }
  });

  const updateRouteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RouteApiData }) => {
      console.log('Updating route with data:', { id, data });
      return routes.update(id, data);
    },
    onSuccess: (updatedRoute) => {
      console.log('Route update successful:', updatedRoute);
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setEditingRoute(null);
      setFormData({
        departure: '',
        destination: '',
        departureTime: '',
        estimatedArrival: '',
        fare: 0,
        capacity: 0,
        daysOfWeek: [],
        stops: [''],
        kilometers: 0,
        status: 'active'
      });
    },
    onError: (error) => {
      console.error('Route update failed:', error);
    }
  });

  const deleteRouteMutation = useMutation({
    mutationFn: (id: number) => routes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' }) => 
      routes.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    }
  });

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      // If the date is just a time (HH:mm), add today's date
      if (dateString.includes(':')) {
        const [hours, minutes] = dateString.split(':');
        const today = new Date();
        today.setHours(parseInt(hours), parseInt(minutes));
        return today.toISOString().slice(0, 16);
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };

  const handleEdit = (route: any) => {
    console.log('Starting route edit:', route);
    console.log('Current form state before edit:', formData);
    
    setEditingRoute(route.id);
    const newFormData = {
      departure: route.departure,
      destination: route.destination,
      departureTime: formatDateForInput(route.departureTime),
      estimatedArrival: formatDateForInput(route.estimatedArrival),
      fare: Number(route.fare),
      capacity: Number(route.capacity),
      daysOfWeek: Array.isArray(route.daysOfWeek) ? route.daysOfWeek : [],
      kilometers: Number(route.kilometers || 0),
      stops: Array.isArray(route.stops) ? route.stops : [''],
      status: route.status
    };
    console.log('Setting new form data:', newFormData);
    setFormData(newFormData);
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const newDays = prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day];
      console.log('Days updated:', newDays);
      return { ...prev, daysOfWeek: newDays };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    const formatTimeForSubmission = (dateTimeString: string) => {
      try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return dateTimeString;
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      } catch (error) {
        console.error('Error formatting time:', error);
        return dateTimeString;
      }
    };
    
    if (editingRoute) {
      const updateData: RouteApiData = {
        vendorId: formData.vendorId,
        departure: formData.departure,
        destination: formData.destination,
        departureTime: formatTimeForSubmission(formData.departureTime),
        estimatedArrival: formatTimeForSubmission(formData.estimatedArrival),
        fare: Number(formData.fare),
        capacity: Number(formData.capacity),
        status: formData.status,
        daysOfWeek: formData.daysOfWeek.map(day => day.toLowerCase()),
        kilometers: Number(formData.kilometers),
        stops: formData.stops
      };
      console.log('Preparing update data:', updateData);
      updateRouteMutation.mutate({ id: editingRoute, data: updateData });
    } else {
      // Extract vendor ID from the JWT token
      const token = localStorage.getItem('vendor_token');
      if (!token) {
        console.error('No vendor token found');
        return;
      }
      
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const vendorId = tokenPayload.id;
        
        if (!vendorId) {
          console.error('No vendor ID found in token');
          return;
        }
        
        const createData: RouteFormData = {
          vendorId: vendorId,
          departure: formData.departure,
          destination: formData.destination,
          departureTime: formatTimeForSubmission(formData.departureTime),
          estimatedArrival: formatTimeForSubmission(formData.estimatedArrival),
          fare: Number(formData.fare),
          capacity: Number(formData.capacity) || 44,
          status: 'active' as const,
          daysOfWeek: formData.daysOfWeek.length > 0 ? formData.daysOfWeek.map(day => day.toLowerCase()) : ['monday'],
          kilometers: Number(formData.kilometers) || 0,
          stops: formData.stops.length > 0 ? formData.stops : [formData.departure, formData.destination]
        };
        
        console.log('Creating new route with data:', createData);
        addRouteMutation.mutate(createData);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  };

  const addStop = () => {
    setFormData(prev => ({
      ...prev,
      stops: [...prev.stops, '']
    }));
  };

  const removeStop = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  };

  const updateStop = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.map((stop, i) => i === index ? value : stop)
    }));
  };

  // Sort routes by departure and destination
  const sortedRoutes = React.useMemo(() => {
    if (!routesList) return [];
    return [...routesList].sort((a, b) => {
      const routeA = `${a.departure} ${a.destination}`.toLowerCase();
      const routeB = `${b.departure} ${b.destination}`.toLowerCase();
      return routeA.localeCompare(routeB);
    });
  }, [routesList]);

  const handleToggleStatus = (route: any) => {
    const newStatus = route.status === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ id: route.id, status: newStatus });
  };

  // Add debug logging for form data changes
  React.useEffect(() => {
    console.log('Form data changed:', formData);
  }, [formData]);

  // Add debug logging for editing state
  React.useEffect(() => {
    console.log('Editing route ID changed:', editingRoute);
  }, [editingRoute]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      // If it's a time-only string (HH:mm or HH:mm:ss)
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateString)) {
        const [hours, minutes, seconds] = dateString.split(':').map(Number);
        const today = new Date();
        today.setHours(hours, minutes, seconds || 0, 0);
        return today.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      // Otherwise, treat as a full date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formatDaysOfWeek = (days: string[]) => {
    if (!days || !Array.isArray(days) || days.length === 0) return 'N/A';
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
  };

  const createRouteMutation = useMutation({
    mutationFn: (data: RouteFormData) => routes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast({
        title: "Route Created",
        description: "The route has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create the route. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading routes...</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Routes Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddingRoute(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Route
          </Button>
        </div>
      </div>

      {/* Route Form Modal */}
      {(isAddingRoute || editingRoute) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingRoute ? 'Edit Route' : 'Add New Route'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Departure</label>
                <input
                  type="text"
                  value={formData.departure}
                  onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Departure Time</label>
                <input
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
                <input
                  type="datetime-local"
                  value={formData.estimatedArrival || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedArrival: e.target.value || '' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                <input
                  type="number"
                  value={formData.kilometers || 0}
                  onChange={(e) => setFormData({ ...formData, kilometers: Number(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fare (K)</label>
                <input
                  type="number"
                  value={formData.fare}
                  onChange={(e) => setFormData({ ...formData, fare: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operating Days</label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.daysOfWeek.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stops</label>
                <div className="space-y-2">
                  {formData.stops.map((stop, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={stop}
                        onChange={(e) => updateStop(index, e.target.value)}
                        placeholder={`Stop ${index + 1}`}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeStop(index)}
                        className="px-2 py-1 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addStop}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Stop
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingRoute(false);
                    setEditingRoute(null);
                    setFormData({
                      departure: '',
                      destination: '',
                      departureTime: '',
                      estimatedArrival: '',
                      fare: 0,
                      capacity: 0,
                      daysOfWeek: [],
                      stops: [''],
                      kilometers: 0,
                      status: 'active'
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingRoute ? 'Update' : 'Add'} Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Routes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRoutes.map((route) => (
          <div
            key={route.id}
            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-200 flex flex-col gap-5 mb-8"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
                <span className="inline-flex items-center"><MapPin className="w-7 h-7 text-blue-500 mr-2" />{route.departure}</span>
                <span className="text-gray-400 text-2xl">→</span>
                <span className="inline-flex items-center">{route.destination}</span>
              </h3>
              <span className={`px-4 py-1 rounded-full text-sm font-bold shadow ${route.status === 'active' ? 'bg-green-200 text-green-800 border border-green-400' : 'bg-gray-200 text-gray-500 border border-gray-300'}`}>{route.status.charAt(0).toUpperCase() + route.status.slice(1)}</span>
            </div>
            <div className="flex flex-wrap gap-6 items-center text-base text-gray-700 mb-2 mt-2">
              <span className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full font-semibold">
                <Clock className="w-5 h-5 text-blue-500" />
                {formatDate(route.departureTime)}
              </span>
              <span className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-full font-semibold">
                <Clock className="w-5 h-5 text-green-600" />
                {formatDate(route.estimatedArrival)}
              </span>
              <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full font-semibold">
                <Users className="w-5 h-5 text-gray-500" /> {route.capacity} seats
              </span>
              <span className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-2 rounded-full font-bold border border-green-400 text-lg">
                K{Number(route.fare).toFixed(2)}
              </span>
              <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full font-semibold">
                <MapPin className="w-5 h-5 text-gray-500" /> {route.kilometers} km
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              <span className="font-semibold">Operating Days:</span> {formatDaysOfWeek(route.daysOfWeek)}
            </div>
            {route.stops && route.stops.length > 0 && (
              <div className="text-xs text-gray-500">
                <span className="font-semibold">Stops:</span> {route.stops.join(', ')}
              </div>
            )}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => handleToggleStatus(route)}
                className={`p-3 rounded-full border-2 border-gray-200 bg-white shadow ${route.status === 'active' ? 'text-green-600' : 'text-gray-400'} hover:text-green-800 hover:border-green-400 transition`}
                title={`Click to ${route.status === 'active' ? 'deactivate' : 'activate'}`}
              >
                {route.status === 'active' ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
              <button
                onClick={() => handleEdit(route)}
                className="p-3 rounded-full border-2 border-blue-200 bg-white shadow text-blue-600 hover:text-blue-800 hover:border-blue-400 transition"
                title="Edit Route"
              >
                <Pencil size={20} />
              </button>
              <button
                onClick={() => deleteRouteMutation.mutate(route.id)}
                className="p-3 rounded-full border-2 border-red-200 bg-white shadow text-red-600 hover:text-red-800 hover:border-red-400 transition"
                title="Delete Route"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 