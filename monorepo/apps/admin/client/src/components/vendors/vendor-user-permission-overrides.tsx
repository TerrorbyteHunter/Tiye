import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const AVAILABLE_PERMISSIONS = [
  'routes_view', 'routes_create', 'routes_edit', 'routes_delete',
  'tickets_view', 'tickets_create', 'tickets_edit', 'tickets_delete',
  'buses_view', 'buses_create', 'buses_edit', 'buses_delete',
  'schedules_view', 'schedules_create', 'schedules_edit', 'schedules_delete',
  'reports_view', 'reports_create',
  'customers_view', 'customers_edit',
  'settings_view', 'settings_edit',
];

export function VendorUserPermissionOverrides({ vendorUserId }: { vendorUserId: number }) {
  const [overrides, setOverrides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOverrides();
    // eslint-disable-next-line
  }, [vendorUserId]);

  const loadOverrides = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', `/api/vendor-user-permissions/${vendorUserId}`);
      setOverrides(Array.isArray(response) ? response : []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load permission overrides',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (permission: string, granted: boolean) => {
    try {
      setSaving(true);
      const existing = overrides.find(o => o.permission === permission);
      if (existing) {
        if (existing.granted === granted) {
          // Remove override
          await apiRequest('DELETE', `/api/vendor-user-permissions/${vendorUserId}/${permission}`);
        } else {
          // Update override
          await apiRequest('POST', '/api/vendor-user-permissions', {
            vendor_user_id: vendorUserId,
            permission,
            granted,
          });
        }
      } else {
        // Add new override
        await apiRequest('POST', '/api/vendor-user-permissions', {
          vendor_user_id: vendorUserId,
          permission,
          granted,
        });
      }
      toast({
        title: 'Success',
        description: `Permission ${granted ? 'granted' : 'denied'} successfully`,
      });
      loadOverrides();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update permission',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getPermissionStatus = (permission: string) => {
    const override = overrides.find(o => o.permission === permission);
    return override ? override.granted : null;
  };

  if (loading) return <div>Loading permissions...</div>;

  return (
    <div className="space-y-4">
      {AVAILABLE_PERMISSIONS.map(permission => {
        const status = getPermissionStatus(permission);
        const isGranted = status === true;
        const isDenied = status === false;
        return (
          <div key={permission} className="flex items-center gap-4">
            <Switch
              checked={isGranted}
              onCheckedChange={checked => togglePermission(permission, checked)}
              disabled={saving}
            />
            <span className="font-medium">{permission.replace(/_/g, ' ')}</span>
            {status !== null && (
              <Badge variant={isGranted ? 'default' : 'destructive'} className="text-xs">
                {isGranted ? 'Granted' : 'Denied'}
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
} 