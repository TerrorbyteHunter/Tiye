import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationsPanel from './NotificationsPanel';
import { notifications as notificationsApi } from '../lib/api';
import { LogOut, User2, Ticket, Bell } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter(n => !n.status || n.status.toLowerCase() !== 'read').length
    : 0;
  console.log('Unread notifications:', unreadCount, notifications);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getAll();
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Handler to allow NotificationsPanel to trigger a refresh
  const handleNotificationsUpdate = () => {
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Refetch notifications when panel is opened
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  // Handler to mark notification as read and update state
  const handleNotificationClick = async (notification: any) => {
    try {
      await notificationsApi.markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, status: 'read', read_at: new Date().toISOString() } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex flex-row flex-nowrap overflow-x-auto items-center gap-1 sm:gap-2 py-2 sm:py-3">
            <Link to="/" className="font-extrabold text-xl sm:text-2xl text-purple-700 tracking-wide mr-4 px-2 py-1 rounded hover:bg-purple-50 transition-colors select-none" style={{letterSpacing: '0.05em'}}>
              Tiyende
            </Link>
            <div className="flex-1" />
            <div className="flex flex-row gap-1 sm:gap-2 ml-auto">
              {/* Profile and My Bookings: only show on sm and up */}
              <button
                className="hidden sm:flex bg-white bg-opacity-80 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow hover:bg-blue-100 text-blue-700 font-semibold items-center gap-1 sm:gap-1.5 text-xs sm:text-sm"
                onClick={() => navigate('/profile')}
              >
                <User2 className="w-5 h-5" />
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button
                className="hidden sm:flex bg-white bg-opacity-80 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow hover:bg-green-100 text-green-700 font-semibold items-center gap-1 sm:gap-1.5 text-xs sm:text-sm"
                onClick={() => navigate('/my-bookings')}
              >
                <Ticket className="w-5 h-5" />
                <span className="hidden sm:inline">My Bookings</span>
              </button>
              {/* Bell icon: always show, but only icon on mobile */}
              <button
                className="bg-white bg-opacity-80 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow hover:bg-blue-100 text-blue-700 font-semibold flex items-center justify-center relative"
                onClick={() => setShowNotifications(true)}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {/* No text on mobile, no 'Notifications' word */}
                {/* Notification badge */}
                <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none rounded-full transition-colors ${unreadCount > 0 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600 opacity-70'}`}>{unreadCount}</span>
              </button>
              <button
                className="hidden sm:flex bg-white bg-opacity-80 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow hover:bg-red-100 text-red-600 font-semibold items-center gap-1 sm:gap-1.5 text-xs sm:text-sm"
                onClick={() => { localStorage.clear(); navigate('/login'); }}
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <NotificationsPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onNotificationsUpdate={handleNotificationsUpdate}
      />
    </>
  );
}; 