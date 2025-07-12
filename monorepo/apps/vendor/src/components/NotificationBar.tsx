import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications, Notification } from '../hooks/useNotifications';

export default function NotificationBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <span className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'reminder':
        return <span className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'promo':
        return <span className="w-2 h-2 bg-green-500 rounded-full" />;
      default:
        return <span className="w-2 h-2 bg-blue-500 rounded-full" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                             {unreadCount > 0 && (
                 <button
                   onClick={handleMarkAllAsRead}
                   className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                 >
                   Mark all read
                 </button>
               )}
            </div>
          </div>

          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No notifications</div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notification: Notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      notification.status === 'unread'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-gray-200'
                    } hover:bg-gray-100`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          {notification.status === 'unread' && (
                            <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 5 && (
            <div className="p-3 border-t border-gray-200">
              <Link
                to="/profile/notifications"
                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 