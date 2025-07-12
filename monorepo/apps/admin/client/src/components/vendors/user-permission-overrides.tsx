import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

interface UserPermissionOverride {
  id: string;
  user_id: string;
  permission: string;
  granted: boolean;
  created_at: string;
  created_by: string;
}

interface UserPermissionOverridesProps {
  userId: string;
  userName: string;
}

const PERMISSION_CATEGORIES = {
  routes: {
    title: 'Routes Management',
    color: 'bg-blue-500',
    permissions: [
      { key: 'routes_view', label: 'View Routes' },
      { key: 'routes_create', label: 'Create Routes' },
      { key: 'routes_edit', label: 'Edit Routes' },
      { key: 'routes_delete', label: 'Delete Routes' }
    ]
  },
  tickets: {
    title: 'Tickets Management',
    color: 'bg-green-500',
    permissions: [
      { key: 'tickets_view', label: 'View Tickets' },
      { key: 'tickets_create', label: 'Create Tickets' },
      { key: 'tickets_edit', label: 'Edit Tickets' },
      { key: 'tickets_delete', label: 'Delete Tickets' }
    ]
  },
  buses: {
    title: 'Buses Management',
    color: 'bg-purple-500',
    permissions: [
      { key: 'buses_view', label: 'View Buses' },
      { key: 'buses_create', label: 'Create Buses' },
      { key: 'buses_edit', label: 'Edit Buses' },
      { key: 'buses_delete', label: 'Delete Buses' }
    ]
  },
  schedules: {
    title: 'Schedules Management',
    color: 'bg-orange-500',
    permissions: [
      { key: 'schedules_view', label: 'View Schedules' },
      { key: 'schedules_create', label: 'Create Schedules' },
      { key: 'schedules_edit', label: 'Edit Schedules' },
      { key: 'schedules_delete', label: 'Delete Schedules' }
    ]
  },
  reports: {
    title: 'Reports',
    color: 'bg-red-500',
    permissions: [
      { key: 'reports_view', label: 'View Reports' },
      { key: 'reports_create', label: 'Create Reports' }
    ]
  },
  customers: {
    title: 'Customers',
    color: 'bg-teal-500',
    permissions: [
      { key: 'customers_view', label: 'View Customers' },
      { key: 'customers_edit', label: 'Edit Customers' }
    ]
  },
  settings: {
    title: 'Settings',
    color: 'bg-gray-500',
    permissions: [
      { key: 'settings_view', label: 'View Settings' },
      { key: 'settings_edit', label: 'Edit Settings' }
    ]
  },
  admin: {
    title: 'Administration',
    color: 'bg-yellow-500',
    permissions: [
      { key: 'super_admin', label: 'Super Admin' }
    ]
  }
};

export function UserPermissionOverrides({ userId, userName }: UserPermissionOverridesProps) {
  const [overrides, setOverrides] = useState<UserPermissionOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOverrides();
  }, [userId]);

  const loadOverrides = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<UserPermissionOverride[]>(`/api/admin-permission-overrides/${userId}`);
      setOverrides(response);
    } catch (error) {
      console.error('Error loading permission overrides:', error);
      toast({
        title: "Error",
        description: "Failed to load permission overrides",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (permission: string, granted: boolean) => {
    try {
      setSaving(true);
      // Check if override already exists
      const existingOverride = overrides.find(o => o.permission === permission);
      if (existingOverride) {
        if (existingOverride.granted === granted) {
          // Remove override if toggling to same state
          await apiRequest(`/api/admin-permission-overrides/${userId}/${permission}`, {
            method: 'DELETE'
          });
        } else {
          // Update existing override
          await apiRequest(`/api/admin-permission-overrides/${userId}/${permission}`, {
            method: 'PATCH',
            body: JSON.stringify({ granted })
          });
        }
      } else {
        // Add new override
        await apiRequest('/api/admin-permission-overrides', {
          method: 'POST',
          body: JSON.stringify({
            admin_id: userId,
            permission,
            granted
          })
        });
      }
      toast({
        title: "Success",
        description: `Permission ${granted ? 'granted' : 'denied'} successfully`,
      });
      loadOverrides();
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getPermissionStatus = (permission: string) => {
    const override = overrides.find(o => o.permission === permission);
    return override ? override.granted : null; // null means no override
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permission Overrides</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Overrides for {userName}</CardTitle>
        <CardDescription>
          Toggle specific permissions for this user. These overrides take precedence over role-based permissions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
          <div key={categoryKey} className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
              <h4 className="text-sm font-medium">{category.title}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.permissions.map(permission => {
                const status = getPermissionStatus(permission.key);
                const isGranted = status === true;
                const isDenied = status === false;
                
                return (
                  <div key={permission.key} className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={isGranted}
                        onCheckedChange={(checked) => togglePermission(permission.key, checked)}
                        disabled={saving}
                        className={`${isGranted ? 'data-[state=checked]:bg-green-600' : isDenied ? 'data-[state=checked]:bg-red-600' : ''}`}
                      />
                      <div>
                        <Label className="text-sm font-medium">
                          {permission.label}
                        </Label>
                        {status !== null && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Badge 
                              variant={isGranted ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {isGranted ? 'Granted' : 'Denied'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 