import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { notifications as notificationsApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';
const typeIcons = {
    info: _jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-blue-500 mr-2", title: "Info" }),
    reminder: _jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2", title: "Reminder" }),
    alert: _jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-red-500 mr-2", title: "Alert" }),
    promo: _jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-green-500 mr-2", title: "Promo" }),
};
const bellIcon = (_jsx("svg", { className: "w-7 h-7 text-white", fill: "none", stroke: "currentColor", strokeWidth: "2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }));
const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
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
        }
        catch (err) {
            setError('Failed to load notifications.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchNotifications();
    }, []);
    const handleNotificationClick = async (notification) => {
        if (notification.status !== 'read') {
            try {
                await notificationsApi.markAsRead(notification.id);
                setNotifications((prev) => prev.map((n) => n.id === notification.id ? { ...n, status: 'read' } : n));
            }
            catch (error) {
                // Optionally show error
            }
        }
    };
    const handleMarkAllAsRead = async () => {
        setMarkingAll(true);
        try {
            await notificationsApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
        }
        catch (error) {
            // Optionally show error
        }
        finally {
            setMarkingAll(false);
        }
    };
    const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => n.status !== 'read').length : 0;
    // Sort notifications by created_at descending (latest first)
    const sortedNotifications = [...notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return (_jsxs("div", { className: "max-w-4xl mx-auto py-8 px-2 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between bg-green-600 rounded-xl px-5 py-4 mb-8 shadow-lg relative gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "bg-green-700 rounded-full p-2 flex items-center justify-center", children: bellIcon }), _jsx("h1", { className: "text-2xl font-bold text-white tracking-tight", children: "Notifications" }), unreadCount > 0 && (_jsxs("span", { className: "ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse", children: [unreadCount, " new"] }))] }), _jsxs("button", { className: "flex items-center gap-1 text-white hover:underline text-sm font-medium focus:outline-none mt-2 sm:mt-0", onClick: () => navigate(-1), children: [_jsx("svg", { className: "w-5 h-5 mr-1", fill: "none", stroke: "currentColor", strokeWidth: "2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19l-7-7 7-7" }) }), "Back"] })] }), unreadCount > 0 && (_jsx("div", { className: "flex justify-end mb-4", children: _jsx("button", { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow transition disabled:opacity-60", onClick: handleMarkAllAsRead, disabled: markingAll, children: markingAll ? 'Marking...' : 'Mark all as read' }) })), loading ? (_jsx("div", { className: "text-center py-12 text-gray-500", children: "Loading notifications..." })) : error ? (_jsx("div", { className: "text-center py-12 text-red-500", children: error })) : notifications.length === 0 ? (_jsx("div", { className: "text-center py-12 text-gray-500", children: "No notifications" })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6", children: sortedNotifications.map((n, i) => (_jsxs("div", { className: `rounded-xl p-4 shadow-md border flex items-start gap-3 cursor-pointer transition-all duration-200 relative bg-white hover:shadow-lg hover:-translate-y-0.5 ${n.status === 'read'
                        ? 'opacity-80'
                        : 'bg-blue-50 border-blue-200'} animate-fade-in`, style: { animationDelay: `${i * 40}ms` }, onClick: () => handleNotificationClick(n), children: [typeIcons[n.type] || typeIcons.info, _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "font-semibold text-base mb-1 flex items-center gap-2", children: [n.title, n.status !== 'read' && (_jsx("span", { className: "ml-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full", children: "New" }))] }), _jsx("div", { className: "text-gray-700 text-sm mb-1", children: n.message }), _jsx("div", { className: "text-xs text-gray-400", children: new Date(n.created_at).toLocaleString('en-GB') })] })] }, n.id))) })), _jsx("style", { children: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s both;
        }
      ` })] }));
};
export default NotificationsPage;
