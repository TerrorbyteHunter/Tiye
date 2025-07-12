import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Bell, Check, Trash2, AlertTriangle, Info, CheckCircle, Plus, Send, Users, User, Search, Filter, ChevronLeft, ChevronRight, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  user_id: string;
  recipient_type: 'customer' | 'vendor';
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'reminder' | 'alert' | 'promo';
  status: 'read' | 'unread';
  created_at: string;
  read_at?: string;
  customer_name?: string;
  customer_mobile?: string;
  customer_email?: string;
  vendor_name?: string;
  vendor_phone?: string;
  vendor_email?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const NotificationsPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor'>('customer');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Notification creation form state
  const [notifType, setNotifType] = useState('info');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifStatus, setNotifStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [notifError, setNotifError] = useState('');
  const [notifRecipient, setNotifRecipient] = useState('');
  const [notifBroadcast, setNotifBroadcast] = useState(false);

  // Fetch notification history from API
  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        recipient_type: activeTab,
        page: page.toString(),
        limit: '50'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter);
      
      // Debug logging
      console.log('Fetching notifications with params:', {
        recipient_type: activeTab,
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
        page: page,
        limit: 50,
        url: `http://localhost:3002/api/notifications/history?${params}`
      });
      
      const res = await fetch(`http://localhost:3002/api/notifications/history?${params}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && data.pagination) {
          setNotifications(data.notifications);
          setPagination(data.pagination);
        } else {
          // Fallback for old API structure
          setNotifications(Array.isArray(data) ? data : []);
          setPagination({
            page: 1,
            limit: 50,
            total: Array.isArray(data) ? data.length : 0,
            pages: 1
          });
        }
      } else {
        console.error('Failed to fetch notifications:', res.status, res.statusText);
        setNotifications([]);
        setPagination({
          page: 1,
          limit: 50,
          total: 0,
          pages: 1
        });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notification history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, [activeTab, searchTerm, statusFilter, typeFilter]);

  const handleNotifSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifStatus('idle');
    setNotifError('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3002/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          type: notifType,
          title: notifTitle,
          message: notifMessage,
          user_id: notifBroadcast ? undefined : notifRecipient,
          broadcast: notifBroadcast,
          recipient_type: activeTab,
        }),
      });
      if (!res.ok) throw new Error('Failed to create notification');
      setNotifStatus('success');
      setNotifTitle('');
      setNotifMessage('');
      setNotifRecipient('');
      setNotifBroadcast(false);
      setShowCreateForm(false);
      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
      // Refresh notifications list
      fetchNotifications(1);
    } catch (err: any) {
      setNotifStatus('error');
      setNotifError(err.message || 'Error creating notification');
      toast({
        title: "Error",
        description: err.message || 'Error creating notification',
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:3002/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast({
          title: "Success",
          description: "Notification deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'reminder':
        return <Bell className="h-4 w-4 text-purple-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'promo':
        return <CheckCircle className="h-4 w-4 text-indigo-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'read' ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        <Check className="mr-1 h-3 w-3" />
        Read
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        <Bell className="mr-1 h-3 w-3" />
        Unread
      </Badge>
    );
  };

  const getRecipientInfo = (notification: Notification) => {
    if (notification.recipient_type === 'customer') {
      return (
        <div className="text-sm text-gray-600">
          <div className="font-medium">{notification.customer_name || 'Unknown Customer'}</div>
          <div className="text-xs text-gray-500">
            {notification.customer_mobile && `📱 ${notification.customer_mobile}`}
            {notification.customer_email && ` 📧 ${notification.customer_email}`}
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-sm text-gray-600">
          <div className="font-medium">{notification.vendor_name || 'Unknown Vendor'}</div>
          <div className="text-xs text-gray-500">
            {notification.vendor_phone && `📱 ${notification.vendor_phone}`}
            {notification.vendor_email && ` 📧 ${notification.vendor_email}`}
          </div>
        </div>
      );
    }
  };

  const handlePageChange = (page: number) => {
    fetchNotifications(page);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  // Calculate notification statistics
  const totalNotifications = notifications.length;
  const unreadNotifications = notifications.filter(n => n.status === 'unread').length;
  const readNotifications = notifications.filter(n => n.status === 'read').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-2xl mb-8 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notification Center</h1>
              <p className="text-yellow-100">Manage and send notifications to customers and vendors</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="hidden md:block w-1 h-12 bg-white/30 rounded-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalNotifications}</div>
                  <div className="text-xs text-yellow-200">Total Notifications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{unreadNotifications}</div>
                  <div className="text-xs text-yellow-200">Unread</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{readNotifications}</div>
                  <div className="text-xs text-yellow-200">Read</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Send Notification
              </Button>
              <Button 
                className="bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
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
        {/* Filters and Search */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="promo">Promo</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Tabs */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'customer' | 'vendor')}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="customer" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Customer Notifications
                </TabsTrigger>
                <TabsTrigger value="vendor" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <User className="h-4 w-4 mr-2" />
                  Vendor Notifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="space-y-4 mt-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">No notifications found</p>
                    <p className="text-sm text-gray-400">Notifications will appear here once sent</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <Card key={notification.id} className="backdrop-blur-sm bg-white/60 border-0 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              {getTypeIcon(notification.type)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                  {getStatusBadge(notification.status)}
                                </div>
                                <p className="text-gray-600 mb-2">{notification.message}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{new Date(notification.created_at).toLocaleString()}</span>
                                  {getRecipientInfo(notification)}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="vendor" className="space-y-4 mt-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">No notifications found</p>
                    <p className="text-sm text-gray-400">Notifications will appear here once sent</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <Card key={notification.id} className="backdrop-blur-sm bg-white/60 border-0 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              {getTypeIcon(notification.type)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                  {getStatusBadge(notification.status)}
                                </div>
                                <p className="text-gray-600 mb-2">{notification.message}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{new Date(notification.created_at).toLocaleString()}</span>
                                  {getRecipientInfo(notification)}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Notification Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex justify-center items-start bg-black bg-opacity-80 overflow-y-auto">
          <div className="backdrop-blur-sm bg-white/95 rounded-xl shadow-2xl p-6 w-full max-w-2xl mt-12 mb-12 border-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Send New Notification</h2>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleNotifSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="notifType">Type</Label>
                  <Select value={notifType} onValueChange={setNotifType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="promo">Promo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notifBroadcast">Broadcast</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="notifBroadcast"
                      checked={notifBroadcast}
                      onCheckedChange={setNotifBroadcast}
                    />
                    <Label htmlFor="notifBroadcast">Send to all {activeTab}s</Label>
                  </div>
                </div>
              </div>
              
              {!notifBroadcast && (
                <div>
                  <Label htmlFor="notifRecipient">Recipient ID</Label>
                  <Input
                    id="notifRecipient"
                    value={notifRecipient}
                    onChange={(e) => setNotifRecipient(e.target.value)}
                    placeholder={`Enter ${activeTab} ID`}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="notifTitle">Title</Label>
                <Input
                  id="notifTitle"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="Notification title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="notifMessage">Message</Label>
                <Textarea
                  id="notifMessage"
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Notification message"
                  rows={4}
                  required
                />
              </div>
              
              {notifError && (
                <div className="text-red-500 text-sm">{notifError}</div>
              )}
              
              <div className="flex gap-2">
                <Button type="submit" disabled={notifStatus === 'success'}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage; 