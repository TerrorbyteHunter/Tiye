import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendor } from '../lib/api';
import { routes } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { MapPin, Car, Plus, Trash2, Edit2, BadgeCheck, Users as UsersIcon, Bus as BusIcon } from 'lucide-react';

interface Bus {
  id: number;
  plate_number: string;
  name: string;
  capacity: number;
  assigned_route_id?: number;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export default function Buses() {
  const queryClient = useQueryClient();
  const [newBus, setNewBus] = React.useState({
    plateNumber: '',
    name: '',
    capacity: '',
  });

  const { data: buses = [] } = useQuery({
    queryKey: ['buses'],
    queryFn: vendor.getBuses,
  });

  const { data: routesData = [] } = useQuery({
    queryKey: ['routes'],
    queryFn: routes.getAll,
  });

  const addBusMutation = useMutation({
    mutationFn: vendor.addBus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      setNewBus({ plateNumber: '', name: '', capacity: '' });
    },
  });

  const assignRouteMutation = useMutation({
    mutationFn: vendor.assignRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
    },
  });

  const handleAddBus = (e: React.FormEvent) => {
    e.preventDefault();
    addBusMutation.mutate({
      plateNumber: newBus.plateNumber,
      name: newBus.name,
      capacity: parseInt(newBus.capacity),
    });
  };

  const handleAssignRoute = (busId: number, routeId: string) => {
    assignRouteMutation.mutate({ busId, routeId });
  };

  // Summary stats
  const totalCapacity = buses.reduce((sum: number, bus: Bus) => sum + (bus.capacity || 0), 0);

  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6 flex items-center gap-4 shadow">
          <BusIcon className="w-10 h-10 opacity-80" />
          <div>
            <div className="text-2xl font-bold">{buses.length}</div>
            <div className="text-sm opacity-80">Total Buses</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 flex items-center gap-4 shadow">
          <UsersIcon className="w-10 h-10 opacity-80" />
          <div>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <div className="text-sm opacity-80">Total Capacity</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-xl p-6 flex items-center gap-4 shadow">
          <BadgeCheck className="w-10 h-10 opacity-80" />
          <div>
            <div className="text-2xl font-bold">{buses.filter((b: Bus) => b.assigned_route_id).length}</div>
            <div className="text-sm opacity-80">Assigned to Route</div>
          </div>
        </div>
      </div>

      {/* Add Bus Form */}
      <form onSubmit={handleAddBus} className="space-y-4 bg-white/80 border border-indigo-100 rounded-xl shadow p-6 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><BusIcon className="w-5 h-5 text-blue-600" /> Add New Bus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plateNumber">Plate Number</Label>
            <Input
              id="plateNumber"
              value={newBus.plateNumber}
              onChange={(e) => setNewBus({ ...newBus, plateNumber: e.target.value })}
              placeholder="ABC 123"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Bus Name</Label>
            <Input
              id="name"
              value={newBus.name}
              onChange={(e) => setNewBus({ ...newBus, name: e.target.value })}
              placeholder="Express 1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={newBus.capacity}
              onChange={(e) => setNewBus({ ...newBus, capacity: e.target.value })}
              placeholder="50"
              required
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg hover:from-indigo-600 hover:to-blue-600">Add Bus</Button>
        </div>
      </form>

      {/* Buses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buses.map((bus: Bus) => (
          <div key={bus.id} className="bg-white/80 rounded-xl shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <BusIcon className="w-8 h-8 text-blue-500" />
              <div className="flex-1">
                <div className="text-lg font-bold text-gray-900">{bus.name}</div>
                <div className="text-xs text-gray-500">{bus.plate_number}</div>
              </div>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">ID: {bus.id}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
              <span className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                <UsersIcon className="w-4 h-4" /> {bus.capacity} seats
              </span>
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full font-medium ${bus.assigned_route_id ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                <BadgeCheck className="w-4 h-4" />
                {bus.assigned_route_id ? (
                  <>Assigned</>
                ) : (
                  'Unassigned'
                )}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Route:</span>
                <Select
                  value={bus.assigned_route_id?.toString()}
                  onValueChange={(value) => handleAssignRoute(bus.id, value)}
                >
                  <SelectTrigger className="w-48 bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routesData.map((route: any) => (
                      <SelectItem key={route.id} value={route.id.toString()}>
                        {route.departure} → {route.destination} ({route.departureTime})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Location:</span>
                {bus.currentLocation ? (
                  <Button variant="ghost" size="sm">
                    <MapPin className="mr-2 h-4 w-4" />
                    Track
                  </Button>
                ) : (
                  <span className="text-muted-foreground">No location data</span>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" size="sm">
                <Edit2 className="h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 