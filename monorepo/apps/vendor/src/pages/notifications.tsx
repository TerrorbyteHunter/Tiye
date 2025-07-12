import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Filter, Search, Trash2, Info, AlertTriangle, Gift, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useNotifications, Notification } from '../hooks/useNotifications';
import { EmptyState } from '../../../../packages/ui/src/components/EmptyState';

const typeIcons: Record<string, JSX.Element> = {
  info: <Info className="w-5 h-5 text-blue-500 mr-2" />,
  reminder: <Clock className="w-5 h-5 text-yellow-500 mr-2" />,
  alert: <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />,
  promo: <Gift className="w-5 h-5 text-green-500 mr-2" />,
};

const bellIcon = (
  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const NotificationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();
  
  const { 
    notifications, 
    isLoading, 
    error, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isMarkingAllAsRead 
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status !== 'read') {
      markAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      deleteNotification(id);
    }
  };

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter((notification: Notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-2 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 rounded-2xl px-6 py-5 mb-8 shadow-xl relative gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2 flex items-center justify-center shadow">
            <Bell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight gradient-text">Notifications</h1>
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse">
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          className="flex items-center gap-1 text-white hover:underline text-sm font-medium focus:outline-none mt-2 sm:mt-0"
          onClick={() => navigate(-1)}
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400 shadow"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400 shadow">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400 shadow">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="alert">Alert</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="promo">Promo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mark all as read */}
      {unreadCount > 0 && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllAsRead}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg hover:from-indigo-600 hover:to-blue-600"
          >
            {isMarkingAllAsRead ? 'Marking...' : 'Mark all as read'}
          </Button>
        </div>
      )}
      {/* Notifications List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading notifications...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">Failed to load notifications</div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You have no notifications yet."
          icon={<Bell className="w-12 h-12" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNotifications.map((n, i) => (
            <div
              key={n.id}
              className={`glass rounded-2xl p-4 shadow-xl border-0 flex items-start gap-3 cursor-pointer transition-all duration-200 relative bg-white/80 hover:shadow-2xl hover:-translate-y-0.5 ${
                n.status === 'read'
                  ? 'opacity-80'
                  : 'bg-blue-50 border-blue-200'
              } animate-fade-in`}
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => handleNotificationClick(n)}
            >
              {typeIcons[n.type] || typeIcons.info}
              <div className="flex-1">
                <div className="font-semibold text-base mb-1 flex items-center justify-between">
                  <span>{n.title}</span>
                  <div className="flex items-center gap-2">
                    {n.status !== 'read' && (
                      <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">New</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(n.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-gray-700 text-sm mb-1">{n.message}</div>
                <div className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString('en-GB')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Animation keyframes */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s both;
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage; 