import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from './shared/LoadingSpinner';
import NotificationsPanel from './NotificationsPanel';
import { notifications as notificationsApi } from '../lib/api';
import { LogOut } from 'lucide-react';
import { useResponsive, useIsDesktop } from '../hooks/use-responsive';
import { User2, Ticket, Bell } from 'lucide-react';
const zambiaCities = [
    'Lusaka',
    'Ndola',
    'Kitwe',
    'Kabwe',
    'Chingola',
    'Mufulira',
    'Livingstone',
    'Kasama',
    'Chipata',
    'Solwezi',
    'Mongu',
    'Kafue',
    'Choma',
    'Kapiri Mposhi',
    'Mazabuka'
].sort();
// Helper to format time as HH:mm
const formatTime = (time) => {
    if (!time)
        return '';
    const date = new Date(time);
    return isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};
export const Home = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [fromCity, setFromCity] = useState('');
    const [toCity, setToCity] = useState('');
    const [date, setDate] = useState('');
    const [minDate, setMinDate] = useState(() => new Date().toLocaleDateString('en-CA'));
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [toSuggestions, setToSuggestions] = useState([]);
    const [showFromSuggestions, setShowFromSuggestions] = useState(false);
    const [showToSuggestions, setShowToSuggestions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isDesktop = useIsDesktop();
    const { isMobile } = useResponsive();
    console.log('HOME DEBUG:', { isMobile, isDesktop });
    // Get user info from localStorage
    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        }
        catch {
            return {};
        }
    })();
    const userName = user.name || user.fullName || 'User';
    // Fetch notifications from backend
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setNotificationsLoading(true);
                const response = await notificationsApi.getAll();
                setNotifications(response.data);
            }
            catch (error) {
                console.error('Failed to fetch notifications:', error);
                setNotifications([]);
            }
            finally {
                setNotificationsLoading(false);
            }
        };
        fetchNotifications();
    }, []);
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString)
            return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    const handleFromCityChange = (e) => {
        const value = e.target.value;
        setFromCity(value);
        if (value.length > 0) {
            const filtered = Array.isArray(zambiaCities) ? zambiaCities.filter(city => city.toLowerCase().includes(value.toLowerCase())) : [];
            setFromSuggestions(filtered);
            setShowFromSuggestions(true);
        }
        else {
            setFromSuggestions(zambiaCities);
            setShowFromSuggestions(true);
        }
    };
    const handleToCityChange = (e) => {
        const value = e.target.value;
        setToCity(value);
        if (value.length > 0) {
            const filtered = Array.isArray(zambiaCities) ? zambiaCities.filter(city => city.toLowerCase().includes(value.toLowerCase())) : [];
            setToSuggestions(filtered);
            setShowToSuggestions(true);
        }
        else {
            setToSuggestions(zambiaCities);
            setShowToSuggestions(true);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Format the date for the URL
        const formattedDate = date ? new Date(date).toISOString().split('T')[0] : '';
        navigate(`/search?from=${fromCity}&to=${toCity}&date=${formattedDate}`);
    };
    // Initialize suggestions with all cities
    useEffect(() => {
        setFromSuggestions(zambiaCities);
        setToSuggestions(zambiaCities);
    }, []);
    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            const target = e.target;
            if (!target.closest('.city-input-container')) {
                setShowFromSuggestions(false);
                setShowToSuggestions(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
    // Refresh notifications when the panel is opened (but don't mark all as read automatically)
    useEffect(() => {
        if (showNotifications) {
            (async () => {
                try {
                    const response = await notificationsApi.getAll();
                    setNotifications(response.data);
                }
                catch (err) {
                    console.error('Failed to fetch notifications:', err);
                }
            })();
        }
    }, [showNotifications]);
    useEffect(() => {
        const interval = setInterval(() => {
            setMinDate(new Date().toLocaleDateString('en-CA'));
        }, 60 * 1000); // update every minute
        return () => clearInterval(interval);
    }, []);
    // Handler to refresh notifications after marking one as read
    const handleNotificationClick = async (notification) => {
        console.log('Home: Notification clicked:', notification);
        try {
            await notificationsApi.markAsRead(notification.id);
            console.log('Home: Successfully marked notification as read');
            setNotifications((prev) => prev.map((n) => n.id === notification.id ? { ...n, read: true } : n));
        }
        catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };
    // Desktop-only top-right buttons
    const unreadCount = Array.isArray(notifications) ? notifications.filter(n => n.status !== 'read').length : 0;
    const TopRightButtons = () => (_jsxs("div", { className: "hidden lg:flex fixed top-8 right-8 z-30 gap-3", children: [_jsxs("button", { className: "bg-white bg-opacity-80 rounded-full px-4 py-2 shadow hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-2 text-base", onClick: () => navigate('/profile'), children: [_jsx(User2, { className: "w-5 h-5" }), " Profile"] }), _jsxs("button", { className: "bg-white bg-opacity-80 rounded-full px-4 py-2 shadow hover:bg-green-100 text-green-700 font-semibold flex items-center gap-2 text-base", onClick: () => navigate('/my-bookings'), children: [_jsx(Ticket, { className: "w-5 h-5" }), " My Bookings"] }), _jsxs("button", { className: "bg-white bg-opacity-80 rounded-full px-4 py-2 shadow hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-2 text-base relative", onClick: () => setShowNotifications(true), "aria-label": "Notifications", children: [_jsx(Bell, { className: "w-5 h-5" }), " Notifications", unreadCount > 0 && (_jsx("span", { className: "absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full", children: unreadCount }))] }), _jsxs("button", { className: "bg-white bg-opacity-80 rounded-full px-4 py-2 shadow hover:bg-red-100 text-red-600 font-semibold flex items-center gap-2 text-base", onClick: () => { localStorage.clear(); navigate('/login'); }, children: [_jsx(LogOut, { className: "w-5 h-5" }), " Logout"] })] }));
    // Desktop view
    if (isDesktop) {
        console.log('Rendering DESKTOP branch');
        return (_jsxs("div", { className: "min-h-screen w-full relative flex items-center justify-center", style: {
                backgroundImage: 'url(/images/victoria-falls.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }, children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-50" }), _jsx(TopRightButtons, {}), _jsxs("div", { className: "relative z-20 flex flex-col items-center justify-center w-full h-full", children: [_jsxs("div", { className: "bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto border border-gray-100 flex flex-col items-center", children: [_jsx("h2", { className: "text-2xl font-bold mb-6 text-gray-800 text-center", children: "Search for a Bus" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 w-full", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-1 text-base", children: "From" }), _jsx("input", { type: "text", className: "form-input w-full", placeholder: "Departure city", value: fromCity, onChange: handleFromCityChange, onFocus: () => setShowFromSuggestions(true), autoComplete: "off" }), showFromSuggestions && fromSuggestions.length > 0 && (_jsx("div", { className: "absolute left-0 mt-1 w-full bg-white rounded shadow border border-gray-200 z-20 max-h-40 overflow-y-auto", children: fromSuggestions.map(city => (_jsx("div", { className: "px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-700", onClick: () => { setFromCity(city); setShowFromSuggestions(false); }, children: city }, city))) }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-1 text-base", children: "To" }), _jsx("input", { type: "text", className: "form-input w-full", placeholder: "Destination city", value: toCity, onChange: handleToCityChange, onFocus: () => setShowToSuggestions(true), autoComplete: "off" }), showToSuggestions && toSuggestions.length > 0 && (_jsx("div", { className: "absolute left-0 mt-1 w-full bg-white rounded shadow border border-gray-200 z-20 max-h-40 overflow-y-auto", children: toSuggestions.map(city => (_jsx("div", { className: "px-4 py-2 cursor-pointer hover:bg-green-50 text-gray-700", onClick: () => { setToCity(city); setShowToSuggestions(false); }, children: city }, city))) }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-1 text-base", children: "Date" }), _jsx("input", { type: "date", className: "date-input w-full", value: date, min: minDate, onChange: e => setDate(e.target.value), required: true })] }), _jsx("button", { type: "submit", className: "w-full bg-blue-200 hover:bg-blue-300 text-blue-900 rounded-lg font-bold shadow transition-colors text-lg py-2", disabled: isLoading || !fromCity || !toCity || !date, children: isLoading ? _jsx(LoadingSpinner, { size: "small" }) : 'Search Buses' })] })] }), _jsxs("div", { className: "mt-8 w-full max-w-md flex flex-col items-center", children: [_jsxs("div", { className: "bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-4 text-white w-full shadow-md mb-6", children: [_jsx("div", { className: "font-bold text-lg", children: "Unlock 20% Off Your Next Trip" }), _jsx("div", { className: "mb-2", children: "Adventure calls. You save." }), _jsx("button", { className: "bg-white text-green-600 px-4 py-2 rounded-lg font-semibold", children: "Book now" })] }), _jsx("span", { className: "text-gray-100 text-sm mb-2", children: "Share Tiyende with friends:" }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("a", { href: "https://www.facebook.com/sharer/sharer.php?u=https://tiyende.com", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition text-base font-semibold", "aria-label": "Share on Facebook", children: [_jsx("svg", { className: "w-5 h-5 mr-1", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" }) }), "Facebook"] }), _jsxs("a", { href: "https://wa.me/?text=Check%20out%20Tiyende%20for%20bus%20booking!%20https://tiyende.com", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow transition text-base font-semibold", "aria-label": "Share on WhatsApp", children: [_jsx("svg", { className: "w-5 h-5 mr-1", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.617h-.001a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374A9.86 9.86 0 012.1 12.045C2.073 6.504 6.659 1.908 12.199 1.908c2.637 0 5.112 1.027 6.988 2.893a9.825 9.825 0 012.893 6.977c.024 5.542-4.561 10.138-10.029 10.221zm8.413-18.294A11.815 11.815 0 0012.2 0C5.452 0 .066 5.385.001 12.077c-.032 2.13.552 4.21 1.7 6.077L0 24l6.063-1.616a11.89 11.89 0 005.969 1.523h.005c6.748 0 12.234-5.385 12.299-12.077a11.82 11.82 0 00-3.48-8.322z" }) }), "WhatsApp"] })] })] })] }), _jsx(NotificationsPanel, { open: showNotifications, onClose: () => setShowNotifications(false), notifications: notifications, onNotificationClick: handleNotificationClick, onNotificationsUpdate: () => { } })] }));
    }
    // Mobile/Tablet view
    console.log('Rendering MOBILE/TABLET branch');
    return (_jsxs("div", { className: "min-h-screen flex flex-col justify-end bg-gradient-to-br from-blue-50 via-purple-50 to-white pb-20 sm:pb-0 relative", children: [_jsx("div", { className: "w-full", style: { height: '240px', marginTop: 0, paddingTop: 0 }, children: _jsx("img", { src: "/images/victoria-falls.jpg", alt: "Victoria Falls", className: "w-full h-full object-cover object-center", style: { maxHeight: '240px', marginTop: 0, paddingTop: 0 } }) }), _jsxs("div", { className: "relative z-10 flex flex-col items-center w-full -mt-12", children: [_jsxs("div", { className: "mx-2 bg-white rounded-2xl shadow-xl p-4 max-w-md w-full self-center border border-gray-100", style: { marginTop: 0 }, children: [_jsx("h2", { className: "text-lg font-semibold mb-2 text-gray-800 text-center", children: "Your next adventure is just a search away" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-1 text-sm", children: "From" }), _jsx("input", { type: "text", className: "form-input w-full", placeholder: "Departure city", value: fromCity, onChange: handleFromCityChange, onFocus: () => setShowFromSuggestions(true), autoComplete: "off" }), showFromSuggestions && fromSuggestions.length > 0 && (_jsx("div", { className: "absolute left-0 mt-1 w-full bg-white rounded shadow border border-gray-200 z-20 max-h-40 overflow-y-auto", children: fromSuggestions.map(city => (_jsx("div", { className: "px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-700", onClick: () => { setFromCity(city); setShowFromSuggestions(false); }, children: city }, city))) }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-1 text-sm", children: "To" }), _jsx("input", { type: "text", className: "form-input w-full", placeholder: "Destination city", value: toCity, onChange: handleToCityChange, onFocus: () => setShowToSuggestions(true), autoComplete: "off" }), showToSuggestions && toSuggestions.length > 0 && (_jsx("div", { className: "absolute left-0 mt-1 w-full bg-white rounded shadow border border-gray-200 z-20 max-h-40 overflow-y-auto", children: toSuggestions.map(city => (_jsx("div", { className: "px-4 py-2 cursor-pointer hover:bg-green-50 text-gray-700", onClick: () => { setToCity(city); setShowToSuggestions(false); }, children: city }, city))) }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-1 text-sm", children: "Date" }), _jsx("input", { type: "date", className: "date-input w-full", value: date, min: minDate, onChange: e => setDate(e.target.value), required: true })] }), _jsx("button", { type: "submit", className: "w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold shadow hover:from-blue-700 hover:to-purple-700 transition-colors text-lg py-2", disabled: isLoading || !fromCity || !toCity || !date, children: isLoading ? _jsx(LoadingSpinner, {}) : 'Continue' })] })] }), _jsxs("div", { className: "mx-2 mt-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-4 text-white max-w-md w-full self-center shadow-md", children: [_jsx("div", { className: "font-bold text-lg", children: "Unlock 20% Off Your Next Trip" }), _jsx("div", { className: "mb-2", children: "Adventure calls. You save." }), _jsx("button", { className: "bg-white text-green-600 px-4 py-2 rounded-lg font-semibold", children: "Book now" })] }), _jsxs("div", { className: "mt-6 flex flex-col items-center max-w-md w-full self-center", children: [_jsx("span", { className: "text-gray-500 text-sm mb-2", children: "Share Tiyende with friends:" }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("a", { href: "https://www.facebook.com/sharer/sharer.php?u=https://tiyende.com", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition text-base font-semibold", "aria-label": "Share on Facebook", children: [_jsx("svg", { className: "w-5 h-5 mr-1", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" }) }), "Facebook"] }), _jsxs("a", { href: "https://wa.me/?text=Check%20out%20Tiyende%20for%20bus%20booking!%20https://tiyende.com", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow transition text-base font-semibold", "aria-label": "Share on WhatsApp", children: [_jsx("svg", { className: "w-5 h-5 mr-1", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.617h-.001a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374A9.86 9.86 0 012.1 12.045C2.073 6.504 6.659 1.908 12.199 1.908c2.637 0 5.112 1.027 6.988 2.893a9.825 9.825 0 012.893 6.977c.024 5.542-4.561 10.138-10.029 10.221zm8.413-18.294A11.815 11.815 0 0012.2 0C5.452 0 .066 5.385.001 12.077c-.032 2.13.552 4.21 1.7 6.077L0 24l6.063-1.616a11.89 11.89 0 005.969 1.523h.005c6.748 0 12.234-5.385 12.299-12.077a11.82 11.82 0 00-3.48-8.322z" }) }), "WhatsApp"] })] })] }), _jsx("div", { className: "flex-1" })] })] }));
};
