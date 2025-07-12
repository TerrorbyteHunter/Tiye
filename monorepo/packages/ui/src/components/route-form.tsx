import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRouteSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface Vendor {
  id: number;
  name: string;
}

interface RouteFormProps {
  route?: {
    id: number;
    vendorId: number;
    departure: string;
    destination: string;
    departureTime: string;
    estimatedArrival: string;
    fare: number;
    capacity: number;
    status: "active" | "inactive";
    daysOfWeek: string[];
    kilometers: number;
    stops: string[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RouteForm({ route, onSuccess, onCancel }: RouteFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!route;
  
  const { data: vendors = [] } = useQuery<{ data: Vendor[] }>({
    queryKey: ['/api/vendors'],
  });
  
  const form = useForm({
    resolver: zodResolver(insertRouteSchema),
    defaultValues: {
      departure: "",
      destination: "",
      departureTime: "",
      estimatedArrival: "",
      fare: 0,
      capacity: 44,
      status: "active" as const,
      daysOfWeek: [] as string[],
      kilometers: 0,
      stops: [] as string[],
      vendorId: "",
    },
  });
  
  useEffect(() => {
    if (route) {
      const formatTime = (time: string) => {
        if (!time) return "";
        try {
          const date = new Date(time);
          if (isNaN(date.getTime())) return time;
          return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        } catch {
          return time;
        }
      };

      form.reset({
        departure: route.departure,
        destination: route.destination,
        departureTime: formatTime(route.departureTime),
        estimatedArrival: formatTime(route.estimatedArrival),
        fare: route.fare,
        capacity: route.capacity,
        status: route.status,
        daysOfWeek: route.daysOfWeek || [],
        kilometers: route.kilometers || 0,
        stops: route.stops || [],
        vendorId: route.vendorId.toString(),
      });
    }
  }, [route, form]);

  const onSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formatTimeForSubmission = (time: string) => {
        if (!time) return null;
        try {
          const [hours, minutes] = time.split(':');
          const date = new Date();
          date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          return date.toISOString();
        } catch {
          return null;
        }
      };

      const formattedValues = {
        ...values,
        departureTime: formatTimeForSubmission(values.departureTime),
        estimatedArrival: formatTimeForSubmission(values.estimatedArrival),
        kilometers: Number(values.kilometers) || 0,
        vendorId: Number(values.vendorId),
        daysOfWeek: Array.isArray(values.daysOfWeek) ? values.daysOfWeek : [],
        stops: Array.isArray(values.stops) ? values.stops : [],
      };

      if (route) {
        await api.patch(`/routes/${route.id}`, formattedValues);
      } else {
        await api.post('/routes', formattedValues);
      }
      
      onSuccess?.();
      toast({
        title: "Success",
        description: `Route ${isEditing ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      console.error("Error saving route:", error);
      setError("Failed to save route");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="departure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departure</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="departureTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departure Time</FormLabel>
              <FormControl>
                <Input 
                  type="time" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estimatedArrival"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Arrival Time</FormLabel>
              <FormControl>
                <Input 
                  type="time" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="kilometers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distance (Kilometers)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  min={0}
                  step={0.1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fare"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fare (K)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  min={0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  min={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="daysOfWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Days of Week</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={(value) => field.onChange(value.split(","))}
                  value={field.value.join(",")}
                  multiple
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stops"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stops</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {field.value.map((stop: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={stop}
                        onChange={(e) => {
                          const newStops = [...field.value];
                          newStops[index] = e.target.value;
                          field.onChange(newStops);
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          const newStops = field.value.filter((_, i) => i !== index);
                          field.onChange(newStops);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => field.onChange([...field.value, ""])}
                  >
                    Add Stop
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vendorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Route" : "Create Route"}
          </Button>
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
      </form>
    </Form>
  );
} 