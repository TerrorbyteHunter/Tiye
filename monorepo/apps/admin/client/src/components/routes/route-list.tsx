import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Route } from "@shared/schema";
import { formatDateTime } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  CheckCircle, 
  XCircle,
  Clock
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteForm } from './route-form';

interface RouteListProps {
  onEdit: (route: Route) => void;
}

const RouteStatusBadge = ({ status }: { status: Route["status"] }) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" /> Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="mr-1 h-3 w-3" /> Inactive
        </Badge>
      );
    default:
      return null;
  }
};

export function RouteList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteRouteId, setDeleteRouteId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  
  const { data: routes = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/routes'],
  });
  
  const { data: vendors = [] } = useQuery<any[]>({
    queryKey: ['/api/vendors'],
  });
  
  const routeToDelete = routes.find((r: any) => r.id === deleteRouteId);
  
  const filteredRoutes = searchTerm 
    ? routes.filter((route: any) => {
        const dep = (route.departure || '').toLowerCase();
        const dest = (route.destination || '').toLowerCase();
        const vendor = (route.vendorName || '').toLowerCase();
        return (
          dep.includes(searchTerm.toLowerCase()) ||
          dest.includes(searchTerm.toLowerCase()) ||
          vendor.includes(searchTerm.toLowerCase())
        );
      })
    : routes;
  
  // Sort filteredRoutes alphabetically by departure, then destination
  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    const depA = a.departure.toLowerCase();
    const depB = b.departure.toLowerCase();
    if (depA < depB) return -1;
    if (depA > depB) return 1;
    // If departure is the same, sort by destination
    const destA = a.destination.toLowerCase();
    const destB = b.destination.toLowerCase();
    if (destA < destB) return -1;
    if (destA > destB) return 1;
    return 0;
  });
  
  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find((v: any) => v.id === vendorId);
    return vendor ? vendor.name : `Vendor #${vendorId}`;
  };
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/routes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      toast({
        title: "Success",
        description: "Route deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to delete route',
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      await deleteMutation.mutateAsync(id);
    }
  };
  
  const handleEdit = (route: any) => {
    setSelectedRoute(route);
    setIsFormOpen(true);
  };
  
  const handleFormClose = () => {
    setSelectedRoute(null);
    setIsFormOpen(false);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Routes</CardTitle>
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Routes</h2>
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Search by route or vendor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setIsFormOpen(true)}>Add Route</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Departure Time</TableHead>
                <TableHead>Arrival Time</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRoutes?.map((route: any) => (
                <TableRow key={route.id}>
                  <TableCell>
                    {route.departure} → {route.destination}
                  </TableCell>
                  <TableCell>{formatDateTime(route.departureTime || route.departuretime)}</TableCell>
                  <TableCell>{formatDateTime(route.estimatedArrival || route.estimatedarrival)}</TableCell>
                  <TableCell>{Array.isArray(route.daysofweek) ? route.daysofweek.join(', ') : route.daysofweek || 'N/A'}</TableCell>
                  <TableCell>{route.vendorName || `Vendor #${route.vendorId || 'N/A'}`}</TableCell>
                  <TableCell>
                    <Badge className={route.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {route.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        className="text-sm"
                        onClick={() => handleEdit(route)}
                      >
                        Edit
                      </Button>
                      <Button
                        className="text-sm bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(route.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isFormOpen && (
        <RouteForm
          route={selectedRoute}
          onClose={handleFormClose}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['routes'] });
            handleFormClose();
          }}
        />
      )}
    </div>
  );
}
