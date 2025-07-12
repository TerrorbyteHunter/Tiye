import { Button } from "@/components/ui/button";
import { Shield, Users, Lock, Key, Crown, UserCheck, Download } from "lucide-react";
import { RoleManagement } from "@/components/vendors/role-management";

export default function RolesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl mb-8 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Roles & Permissions</h1>
              <p className="text-indigo-100">Manage role templates and permissions for users and vendors</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="hidden md:block w-1 h-12 bg-white/30 rounded-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-xs text-indigo-200">Total Roles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-xs text-indigo-200">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-xs text-indigo-200">Permissions</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <Key className="mr-2 h-4 w-4" />
                Add Role
              </Button>
              <Button 
                className="bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Roles
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Super Admin</div>
                <div className="text-sm text-gray-600">Full system access</div>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Admin</div>
                <div className="text-sm text-gray-600">Management access</div>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Staff</div>
                <div className="text-sm text-gray-600">Limited access</div>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Vendor</div>
                <div className="text-sm text-gray-600">Business access</div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Management Component */}
        <div className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-xl">
          <RoleManagement />
        </div>
      </div>
    </div>
  );
} 