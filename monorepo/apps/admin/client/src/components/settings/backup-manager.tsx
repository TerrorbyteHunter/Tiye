import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Database, Download, RefreshCw, Clock, AlertTriangle, CheckCircle, XCircle, BarChart3, Shield, Users, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/api";

interface BackupInfo {
  filename: string;
  type: string;
  description: string;
  size: string;
  created: string;
  status: 'success' | 'failed' | 'in_progress';
  metadata?: {
    recordCount?: number;
    tables?: string[];
    compressionRatio?: number;
  };
}

interface BackupType {
  type: string;
  description: string;
  tables: string[];
  includeFiles?: boolean;
  compression?: boolean;
  encryption?: boolean;
}

export function BackupManager() {
  const { toast } = useToast();
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [backupTypes, setBackupTypes] = useState<BackupType[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [scheduledBackups, setScheduledBackups] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [retentionDays, setRetentionDays] = useState('30');
  const [selectedBackupType, setSelectedBackupType] = useState('full');

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<BackupInfo[]>('/api/backups');
      setBackups(response);
    } catch (error) {
      toast({
        title: "Failed to fetch backups",
        description: "Could not retrieve the list of backups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBackupTypes = async () => {
    try {
      const response = await apiRequest<BackupType[]>('/api/backups/types');
      setBackupTypes(response);
    } catch (error) {
      console.error('Failed to fetch backup types:', error);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      const response = await apiRequest('/api/backups', { 
        method: 'POST',
        body: JSON.stringify({ type: selectedBackupType })
      });
      
      toast({
        title: `${selectedBackupType} backup created`,
        description: "Database backup has been created successfully.",
      });
      // Refresh the list
      fetchBackups();
    } catch (error) {
      toast({
        title: "Backup failed",
        description: "Could not create database backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = async (filename: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/backups/${filename}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Download started",
        description: "Backup file download has started.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the backup file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteBackup = async (filename: string) => {
    try {
      await apiRequest(`/api/backups/${filename}`, { method: 'DELETE' });
      toast({
        title: "Backup deleted",
        description: "Backup file has been deleted successfully.",
      });
      fetchBackups();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete the backup file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateBackupSettings = async () => {
    try {
      await apiRequest('/api/settings/backup_scheduled', { 
        method: 'POST',
        body: JSON.stringify({ value: scheduledBackups.toString() })
      });
      await apiRequest('/api/settings/backup_frequency', { 
        method: 'POST',
        body: JSON.stringify({ value: backupFrequency })
      });
      await apiRequest('/api/settings/backup_retention_days', { 
        method: 'POST',
        body: JSON.stringify({ value: retentionDays })
      });
      
      toast({
        title: "Settings updated",
        description: "Backup settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Settings update failed",
        description: "Could not update backup settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBackups();
    fetchBackupTypes();
  }, []);

  // Format the backup filename for display
  const formatBackupName = (filename: string) => {
    // Extract timestamp from backup-type-YYYY-MM-DDTHH-MM-SS-SSSZ.sql
    const match = filename.match(/backup-\w+-(.+)\.sql/);
    if (match && match[1]) {
      const timestamp = match[1].replace(/-/g, ':').replace('T', ' ');
      return timestamp;
    }
    return filename;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getBackupTypeIcon = (type: string) => {
    switch (type) {
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'audit':
        return <Shield className="h-4 w-4" />;
      case 'operational':
        return <Database className="h-4 w-4" />;
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getBackupTypeBadge = (type: string) => {
    const colors = {
      full: "bg-blue-100 text-blue-800",
      analytics: "bg-purple-100 text-purple-800",
      audit: "bg-red-100 text-red-800",
      operational: "bg-green-100 text-green-800",
      users: "bg-orange-100 text-orange-800",
      settings: "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || colors.full}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Backup Settings
          </CardTitle>
          <CardDescription>Configure automatic backup settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Scheduled Backups</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create backups at regular intervals
              </p>
            </div>
            <Switch
              checked={scheduledBackups}
              onCheckedChange={setScheduledBackups}
            />
          </div>
          
          {scheduledBackups && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Backup Frequency</Label>
                  <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Retention (days)</Label>
                  <Select value={retentionDays} onValueChange={setRetentionDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={updateBackupSettings} size="sm">
                Save Settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Manual Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Manual Backup
          </CardTitle>
          <CardDescription>Create a backup of your database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Backup Type</Label>
              <Select value={selectedBackupType} onValueChange={setSelectedBackupType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {backupTypes.map((type) => (
                    <SelectItem key={type.type} value={type.type}>
                      <div className="flex items-center gap-2">
                        {getBackupTypeIcon(type.type)}
                        <span>{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Create a manual backup of your database. This may take a few minutes.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={fetchBackups} 
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                
                <Button 
                  onClick={createBackup} 
                  disabled={creating}
                  variant="default"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Create Backup
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>View and manage your database backups</CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No backups found. Create your first backup to get started.
            </p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Date & Time</th>
                    <th className="text-left p-3 text-sm font-medium">Type</th>
                    <th className="text-left p-3 text-sm font-medium">Size</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(backup.status)}
                          {formatBackupName(backup.filename)}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {getBackupTypeBadge(backup.type)}
                      </td>
                      <td className="p-3 text-sm">{backup.size}</td>
                      <td className="p-3 text-sm">
                        {getStatusBadge(backup.status)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => downloadBackup(backup.filename)}
                            disabled={backup.status === 'in_progress'}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteBackup(backup.filename)}
                            disabled={backup.status === 'in_progress'}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
