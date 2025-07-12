import { useQuery } from '@tanstack/react-query';
import { AdminList } from "@/components/users/user-list";
import { useState } from "react";
import { UserForm } from "@/components/users/user-form";
import { UserPermissionOverrides } from "@/components/vendors/user-permission-overrides";
import { Users, Shield, Crown, Activity, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocalAdmin {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  lastLogin?: string;
}

export default function Admins() {
  const { data: admins = [], isLoading, error } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const res = await fetch('/api/admins', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch admins');
      return res.json();
    },
  });

  const [editingAdmin, setEditingAdmin] = useState<LocalAdmin | null>(null);

  // Calculate admin statistics
  const totalAdmins = admins.length;
  const activeAdmins = admins.filter((admin: LocalAdmin) => admin.active).length;
  const superAdmins = admins.filter((admin: LocalAdmin) => admin.role === 'admin').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl mb-8 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Management</h1>
              <p className="text-purple-100">Manage system administrators and their permissions</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="hidden md:block w-1 h-12 bg-white/30 rounded-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalAdmins}</div>
                  <div className="text-xs text-purple-200">Total Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{activeAdmins}</div>
                  <div className="text-xs text-purple-200">Active Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{superAdmins}</div>
                  <div className="text-xs text-purple-200">Super Admins</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
              <Button 
                className="bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <Activity className="mr-2 h-4 w-4" />
                Activity Log
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
        <div className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-xl">
          <AdminList onEdit={(admin) => setEditingAdmin({
            ...admin,
            lastLogin: admin.lastLogin ? new Date(admin.lastLogin).toISOString() : undefined,
          })} />
        </div>
      </div>

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex justify-center items-start bg-black bg-opacity-80 overflow-y-auto">
          <div className="backdrop-blur-sm bg-white/95 rounded-xl shadow-2xl p-6 w-full max-w-4xl mt-12 mb-12 border-0">
            <UserForm user={editingAdmin} onClose={() => setEditingAdmin(null)} />
            <div className="mt-8">
              <UserPermissionOverrides userId={editingAdmin.id.toString()} userName={editingAdmin.fullName} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 