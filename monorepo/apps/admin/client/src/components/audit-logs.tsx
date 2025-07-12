import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { formatDateTime } from '@/lib/api';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface AuditLogsProps {
  className?: string;
}

export function AuditLogs({ className }: AuditLogsProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    resourceType: '',
    startDate: '',
    endDate: ''
  });
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadLogs();
  }, [currentPage, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: ((currentPage - 1) * ITEMS_PER_PAGE).toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value.trim() !== '')
        )
      });

      console.log('Loading audit logs with params:', params.toString());

      const [logsResponse, countResponse] = await Promise.all([
        apiRequest<AuditLog[]>(`/api/audit-logs?${params}`),
        apiRequest<{ count: number }>(`/api/audit-logs/count?${params}`)
      ]);

      console.log('Audit logs response:', logsResponse);
      console.log('Count response:', countResponse);

      setLogs(logsResponse);
      setTotalCount(countResponse.count);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      action: '',
      resourceType: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  const getActionColor = (action: string) => {
    if (!action) return 'default';
    
    switch (action.toLowerCase()) {
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      case 'login': return 'outline';
      case 'logout': return 'outline';
      default: return 'default';
    }
  };

  const getResourceTypeColor = (resourceType: string) => {
    if (!resourceType) return 'outline';
    
    switch (resourceType.toLowerCase()) {
      case 'vendor': return 'default';
      case 'route': return 'secondary';
      case 'ticket': return 'outline';
      case 'user': return 'destructive';
      case 'role': return 'default';
      default: return 'outline';
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading && logs.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>
          System activity logs for security and compliance monitoring.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="Filter by user..."
            />
          </div>
          <div>
            <Label htmlFor="action">Action</Label>
            <Input
              id="action"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              placeholder="Filter by action..."
            />
          </div>
          <div>
            <Label htmlFor="resourceType">Resource Type</Label>
            <Input
              id="resourceType"
              value={filters.resourceType}
              onChange={(e) => handleFilterChange('resourceType', e.target.value)}
              placeholder="Filter by resource..."
            />
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Logs */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">
              {totalCount} total logs
            </h4>
            {loading && <span className="text-sm text-muted-foreground">Loading...</span>}
          </div>

          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No audit logs found.
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getActionColor(log.action || 'unknown')}>
                        {log.action || 'unknown'}
                      </Badge>
                      <Badge variant={getResourceTypeColor(log.resource_type)}>
                        {log.resource_type || 'unknown'}
                      </Badge>
                      <span className="text-sm font-medium">
                        {log.resource_id || 'N/A'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="ml-2 font-mono">{log.user_id || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IP Address:</span>
                      <span className="ml-2 font-mono">{log.ip_address || 'N/A'}</span>
                    </div>
                  </div>

                  {log.details && Object.keys(log.details).length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Details:</span>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 