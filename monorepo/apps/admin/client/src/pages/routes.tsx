import { useState } from "react";
import { useLocation } from "wouter";
import { RouteList } from "@/components/routes/route-list";
import { RouteForm } from "@/components/routes/route-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, MapPin, Bus, Clock, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "@shared/schema";

export default function Routes() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(location.includes("?action=new"));
  const [editRoute, setEditRoute] = useState<Route | null>(null);
  
  // Handle route form submission success
  const handleSuccess = () => {
    setShowAddForm(false);
    setEditRoute(null);
    queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
    
    // Remove ?action=new from URL if present
    if (location.includes("?action=new")) {
      setLocation("/routes");
    }
  };
  
  const handleEdit = (route: Route) => {
    setEditRoute(route);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl mb-8 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Bus Routes</h1>
              <p className="text-green-100">Manage routes and schedules for all vendors</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="hidden md:block w-1 h-12 bg-white/30 rounded-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-xs text-green-200">Active Routes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-xs text-green-200">Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-xs text-green-200">Daily Trips</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Route
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
        <RouteList />
      </div>
      
      {/* Add Route Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new bus route.
            </DialogDescription>
          </DialogHeader>
          <RouteForm onSuccess={handleSuccess} onClose={() => setShowAddForm(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Route Dialog */}
      <Dialog open={editRoute !== null} onOpenChange={(open) => !open && setEditRoute(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
            <DialogDescription>
              Update the route information below.
            </DialogDescription>
          </DialogHeader>
          {editRoute && (
            <RouteForm 
              route={editRoute} 
              onSuccess={handleSuccess} 
              onClose={() => setEditRoute(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
