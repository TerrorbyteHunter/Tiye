import React, { useEffect, useState } from 'react';
import { notifications as notificationsApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const typeIcons: Record<string, JSX.Element> = {
  info: <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" title="Info" />,
  reminder: <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2" title="Reminder" />,
  alert: <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2" title="Alert" />,
  promo: <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" title="Promo" />,
};

const bellIcon = (
  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationsApi.getAll();
      setNotifications(res.data);
    } catch (err: any) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (notification.status !== 'read') {
      try {
        await notificationsApi.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, status: 'read' } : n
          )
        );
      } catch (error) {
        // Optionally show error
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
    } catch (error) {
      // Optionally show error
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => n.status !== 'read').length : 0;

  // Sort notifications by created_at descending (latest first)
  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-green-600 rounded-xl px-5 py-4 mb-8 shadow-lg relative gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-green-700 rounded-full p-2 flex items-center justify-center">
            {bellIcon}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
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
      {/* Mark all as read */}
      {unreadCount > 0 && (
        <div className="flex justify-end mb-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow transition disabled:opacity-60"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        </div>
      )}
      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading notifications...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No notifications</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedNotifications.map((n, i) => (
            <div
              key={n.id}
              className={`rounded-xl p-4 shadow-md border flex items-start gap-3 cursor-pointer transition-all duration-200 relative bg-white hover:shadow-lg hover:-translate-y-0.5 ${
                n.status === 'read'
                  ? 'opacity-80'
                  : 'bg-blue-50 border-blue-200'
              } animate-fade-in`}
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => handleNotificationClick(n)}
            >
              {typeIcons[n.type] || typeIcons.info}
              <div className="flex-1">
                <div className="font-semibold text-base mb-1 flex items-center gap-2">
                  {n.title}
                  {n.status !== 'read' && (
                    <span className="ml-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">New</span>
                  )}
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