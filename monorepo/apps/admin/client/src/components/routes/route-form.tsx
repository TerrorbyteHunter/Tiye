import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API, apiRequestWithSnakeCase, formatDateTime, apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface RouteFormProps {
  route?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Utility to format date for datetime-local input
function toDateTimeLocal(dt: string | Date | null): string {
  if (!dt) return '';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RouteForm({ route, onClose, onSuccess }: RouteFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<{
    vendorId: string | number;
    departure: string;
    destination: string;
    departureTime: string;
    estimatedArrival: string;
    fare: string | number;
    capacity: string | number;
    status: string;
    daysOfWeek: string[];
    kilometers: string | number;
    stops: string[];
    stopsText: string;
  }>({
    vendorId: route?.vendorId || '',
    departure: route?.departure || '',
    destination: route?.destination || '',
    departureTime: route?.departureTime ? toDateTimeLocal(route.departureTime) : '',
    estimatedArrival: route?.estimatedArrival ? toDateTimeLocal(route.estimatedArrival) : '',
    fare: route?.fare || '',
    capacity: route?.capacity || 44,
    status: route?.status || 'active',
    daysOfWeek: Array.from(new Set(route?.daysOfWeek || [])),
    kilometers: route?.kilometers || '',
    stops: route?.stops || [],
    stopsText: route?.stops?.join(', ') || '',
  });

  // Fetch vendors for dropdown
  const { data: vendors = [] } = useQuery<any[]>({
    queryKey: ['vendors'],
    queryFn: () => apiRequest(API.vendors),
  });

  // Create/Update route mutation
  const mutation = useMutation({
    mutationFn: (data: any) => {
      // Convert data types and deduplicate daysOfWeek
      const processedData = {
        ...data,
        vendorId: parseInt(data.vendorId),
        fare: parseInt(data.fare),
        capacity: parseInt(data.capacity),
        kilometers: parseInt(data.kilometers),
        stops: data.stopsText.split(',').map((stop: string) => stop.trim()).filter(Boolean),
        daysOfWeek: Array.from(new Set(data.daysOfWeek)),
        departureTime: data.departureTime || '',
        estimatedArrival: data.estimatedArrival ? new Date(data.estimatedArrival).toISOString() : '',
      };
      delete processedData.days_of_week;
      delete processedData.departure_time;
      delete processedData.estimated_arrival;

      const endpoint = route ? API.routeById(route.id) : API.routes;
      const method = route ? 'PATCH' : 'POST';
      return apiRequestWithSnakeCase(endpoint, {
        method,
        body: JSON.stringify(processedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success(route ? 'Route updated successfully' : 'Route created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save route');
    },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.vendorId || !formData.departure || !formData.destination || 
        !formData.departureTime || !formData.fare || !formData.kilometers || 
        formData.daysOfWeek.length === 0 || !formData.stopsText.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    await mutation.mutateAsync(formData);
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes for days of week
  const handleDayChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? (prev.daysOfWeek as string[]).filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{route ? 'Edit Route' : 'Add New Route'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendorId">Vendor *</Label>
              <Select
                value={formData.vendorId.toString()}
                onValueChange={(value: string) => handleSelectChange('vendorId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor: any) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departure">Departure *</Label>
              <Input
                id="departure"
                name="departure"
                value={formData.departure}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureTime">Departure Time *</Label>
              <Input
                id="departureTime"
                name="departureTime"
                type="time"
                value={formData.departureTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedArrival">Estimated Arrival</Label>
              <Input
                id="estimatedArrival"
                name="estimatedArrival"
                type="datetime-local"
                value={formData.estimatedArrival}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fare">Fare (K) *</Label>
              <Input
                id="fare"
                name="fare"
                type="number"
                min="0"
                value={formData.fare}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kilometers">Distance (km) *</Label>
            <Input
              id="kilometers"
              name="kilometers"
              type="number"
              min="0"
              value={formData.kilometers}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Operating Days *</Label>
            <div className="grid grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day}`}
                    checked={formData.daysOfWeek.includes(day)}
                    onCheckedChange={() => handleDayChange(day)}
                  />
                  <Label htmlFor={`day-${day}`}>{day}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stopsText">Stops (comma-separated) *</Label>
            <Textarea
              id="stopsText"
              name="stopsText"
              value={formData.stopsText}
              onChange={handleChange}
              placeholder="Enter stops separated by commas"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : route ? 'Update Route' : 'Create Route'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
