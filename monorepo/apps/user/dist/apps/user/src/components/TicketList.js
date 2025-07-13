import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, CalendarDays, AlertCircle, RefreshCw, Ticket as TicketIcon, Clock, User2 } from 'lucide-react';
import { tickets as ticketsApi } from '../lib/api';
const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        // Get user info from localStorage for debugging
        const user = (() => {
            try {
                return JSON.parse(localStorage.getItem('user') || '{}');
            }
            catch {
                return {};
            }
        })();
        setUserInfo(user);
        fetchTickets();
        // Auto-refresh every 30 seconds to catch new bookings
        const interval = setInterval(fetchTickets, 30000);
        return () => clearInterval(interval);
    }, []);
    const fetchTickets = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            }
            else {
                setLoading(true);
            }
            setError(null);
            console.log('Fetching tickets...');
            console.log('User info from localStorage:', userInfo);
            const token = localStorage.getItem('token');
            console.log('Token present:', !!token);
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setLoading(false);
                setRefreshing(false);
                return;
            }
            const response = await ticketsApi.getByUser();
            console.log('Tickets response:', response.data);
            if (response.data && Array.isArray(response.data)) {
                setTickets(response.data);
                if (showRefreshing && response.data.length > 0) {
                    // Show a brief success message if new tickets were found
                    const newTickets = response.data.filter(ticket => new Date(ticket.bookingDate).getTime() > Date.now() - 60000 // Tickets created in last minute
                    );
                    if (newTickets.length > 0) {
                        console.log('Found new tickets:', newTickets.length);
                    }
                }
            }
            else {
                console.error('Invalid tickets response:', response.data);
                setError('Invalid response from server');
            }
        }
        catch (err) {
            console.error('Error fetching tickets:', err);
            setError(err?.response?.data?.error || 'Failed to load tickets. Please try again.');
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const formatTime = (timeString) => {
        if (!timeString)
            return 'N/A';
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
        catch {
            return timeString;
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsx("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "flex items-center justify-center py-12", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "h-6 w-6 animate-spin text-blue-600" }), _jsx("span", { className: "text-gray-600", children: "Loading your bookings..." })] }) }) }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsx("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [_jsx(AlertCircle, { className: "h-6 w-6 text-red-500" }), _jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Error Loading Bookings" })] }), _jsx("p", { className: "text-gray-600 mb-4", children: error }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg mb-4", children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "Debug Information:" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("p", { children: ["User ID: ", userInfo?.id || 'Not found'] }), _jsxs("p", { children: ["User Mobile: ", userInfo?.mobile || 'Not found'] }), _jsxs("p", { children: ["User Email: ", userInfo?.email || 'Not found'] }), _jsxs("p", { children: ["Token Present: ", localStorage.getItem('token') ? 'Yes' : 'No'] })] })] }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: () => fetchTickets(true), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: "Try Again" }), _jsx("button", { onClick: () => navigate('/login'), className: "px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors", children: "Re-login" })] })] }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-white py-0 pb-20 sm:pb-0", children: [_jsxs("div", { className: "sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-blue-100 shadow-sm px-2 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [_jsx(TicketIcon, { className: "h-7 w-7 sm:h-9 sm:w-9 text-blue-600" }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight", children: "My Bookings" }), _jsx("div", { className: "h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2" }), _jsx("p", { className: "text-sm sm:text-lg text-gray-600 mt-1", children: "View and manage your bus ticket bookings" })] })] }), _jsxs("button", { onClick: () => fetchTickets(true), disabled: refreshing, className: "flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50", title: "Refresh", children: [_jsx(RefreshCw, { className: `h-5 w-5 ${refreshing ? 'animate-spin' : ''}` }), _jsx("span", { className: "hidden sm:inline font-semibold", children: "Refresh" })] })] }), _jsx("div", { className: "max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 py-8", children: tickets.length === 0 ? (_jsxs("div", { className: "bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-16 text-center flex flex-col items-center justify-center mt-16", children: [_jsx(Plane, { className: "h-16 w-16 text-blue-200 mb-4" }), _jsx("h3", { className: "text-xl sm:text-2xl font-semibold text-gray-900 mb-2", children: "No Bookings Found" }), _jsx("p", { className: "text-base text-gray-600 mb-6", children: "You haven't made any bookings yet. Start by searching for available routes." }), _jsx("button", { onClick: () => navigate('/'), className: "px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold shadow hover:from-blue-700 hover:to-purple-700 transition-colors text-lg", children: "Search Routes" })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8", children: tickets.map((ticket, idx) => {
                        // Status badge color
                        let statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-300';
                        if (ticket.status === 'paid')
                            statusColor = 'bg-green-100 text-green-800 border-green-300';
                        if (ticket.status === 'cancelled' || ticket.status === 'refunded')
                            statusColor = 'bg-red-100 text-red-800 border-red-300';
                        return (_jsxs("div", { className: "relative bg-white rounded-2xl shadow-lg border-l-8 border-blue-500 flex flex-col gap-2 p-3 min-h-[120px] hover:shadow-2xl transition-shadow sm:gap-4 sm:p-6 sm:min-h-[220px]", children: [_jsxs("div", { className: "mb-1 w-full sm:mb-2", children: [_jsxs("span", { className: "font-bold text-base text-blue-700 block sm:text-lg", children: [ticket.departure || ticket.route?.departure, " ", _jsx("span", { className: "mx-1", children: "\u2192" }), " ", ticket.destination || ticket.route?.destination] }), _jsxs("span", { className: "flex items-center gap-1 text-gray-500 text-sm whitespace-nowrap mt-0.5 sm:text-base sm:mt-1", children: [_jsx(CalendarDays, { className: "h-4 w-4 text-green-500 sm:h-5 sm:w-5" }), _jsx("span", { className: "font-semibold", children: ticket.travelDate ? new Date(ticket.travelDate).toLocaleDateString('en-GB') : 'N/A' })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2 text-xs text-gray-700 mb-1 sm:gap-4 sm:text-sm sm:mb-2", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(User2, { className: "h-3 w-3 text-blue-500 sm:h-4 sm:w-4" }), " Seat: ", _jsx("span", { className: "font-semibold", children: ticket.seatNumber })] }), _jsxs("div", { className: "flex items-center gap-1 text-green-700", children: [_jsx("span", { className: "font-semibold", children: "Amount:" }), " ", _jsxs("span", { className: "font-bold", children: ["K ", ticket.amount] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-3 w-3 text-purple-500 sm:h-4 sm:w-4" }), " ", ticket.route?.departureTime ? formatTime(ticket.route.departureTime) : ''] })] }), _jsx("div", { className: "flex items-center gap-2 mt-1 sm:mt-2", children: _jsx("span", { className: `border ${statusColor} rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:px-3 sm:py-1 sm:text-xs`, children: ticket.status || 'PENDING' }) }), _jsx("button", { onClick: () => navigate(`/my-bookings/${ticket.bookingReference}`), className: "w-full mt-auto py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold shadow hover:from-blue-700 hover:to-purple-700 transition-colors text-sm sm:py-2 sm:text-base", children: "View E-ticket" })] }, ticket.id || idx));
                    }) })) })] }));
};
export default TicketList;
