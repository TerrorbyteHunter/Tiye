import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { routes as routesApi } from '../lib/api';
import { FaBus, FaMoneyBillWave, FaChair, FaWifi, FaSnowflake, FaPlug, FaCoffee } from 'react-icons/fa';
// Icons for amenities
const WifiIcon = () => (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" }) }));
const ACIcon = () => (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.25 4.5a3.25 3.25 0 006.5 0M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" }) }));
const ChargingIcon = () => (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }));
const RefreshmentsIcon = () => (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" }) }));
const timeRanges = [
    { label: 'Early Morning (00:00 - 06:00)', start: '00:00', end: '06:00' },
    { label: 'Morning (06:00 - 12:00)', start: '06:00', end: '12:00' },
    { label: 'Afternoon (12:00 - 18:00)', start: '12:00', end: '18:00' },
    { label: 'Evening (18:00 - 23:59)', start: '18:00', end: '23:59' }
];
// Helper to format time as HH:mm
const formatTime = (timeString) => {
    if (!timeString)
        return 'N/A';
    // If it's a time-only string (e.g., '08:00' or '08:00:00'), just return the first 5 chars
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString))
        return timeString.slice(0, 5);
    const date = new Date(timeString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};
export const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [buses, setBuses] = useState([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState('all');
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const date = searchParams.get('date') || '';
    const isTimeInRange = (time, range) => {
        const [hours, minutes] = time.split(':').map(Number);
        const [startHours, startMinutes] = range.start.split(':').map(Number);
        const [endHours, endMinutes] = range.end.split(':').map(Number);
        const timeValue = hours * 60 + minutes;
        const startValue = startHours * 60 + startMinutes;
        const endValue = endHours * 60 + endMinutes;
        return timeValue >= startValue && timeValue <= endValue;
    };
    const filteredBuses = selectedTimeRange === 'all'
        ? buses
        : buses.filter(bus => {
            const selectedRange = timeRanges.find(range => range.label === selectedTimeRange);
            return selectedRange ? isTimeInRange(bus.departureTime, selectedRange) : true;
        });
    useEffect(() => {
        const fetchBuses = async () => {
            setIsLoading(true);
            try {
                const response = await routesApi.getAll();
                const allRoutes = response.data;
                const mappedBuses = allRoutes
                    .filter((route) => {
                    const matchesFrom = !from || route.departure.trim().toLowerCase() === from.trim().toLowerCase();
                    const matchesTo = !to || route.destination.trim().toLowerCase() === to.trim().toLowerCase();
                    return matchesFrom && matchesTo;
                })
                    .map((route) => ({
                    id: route.id?.toString() || route.routeId?.toString() || '',
                    company: route.vendorname || route.vendor || route.vendor_name || route.bus_vendor || 'Bus Vendor',
                    departureTime: route.departureTime || route.departure_time || route.departTime || route.depart || '',
                    arrivalTime: route.arrivalTime || route.arrival_time || route.arriveTime || route.arrive || '',
                    price: route.fare || route.price || 0,
                    availableSeats: route.capacity || route.availableSeats || 0,
                    busType: route.busType || 'Standard',
                    amenities: route.amenities || [],
                    from: route.departure || route.from || '',
                    to: route.destination || route.to || '',
                    // Use the backend's departureTime as the date for each bus
                    date: (route.departureTime || route.departure_time || route.departTime || route.depart || '').split('T')[0],
                    vendorId: route.vendorid || route.vendorId || 1,
                }));
                setBuses(mappedBuses);
            }
            catch (error) {
                setBuses([]);
            }
            setIsLoading(false);
        };
        fetchBuses();
    }, [from, to, date]);
    // Debug log for search/filter state
    console.log({ from, to, date, buses });
    if (buses.length > 0) {
        buses.forEach((bus, idx) => {
            console.log(`Bus #${idx + 1}:`, {
                departureTime: bus.departureTime,
                arrivalTime: bus.arrivalTime,
            });
        });
    }
    const handleSelectBus = (busId) => {
        // Find the selected bus
        const selectedBus = buses.find(bus => bus.id === busId);
        if (selectedBus) {
            // Navigate with bus data
            navigate(`/select-seats/${busId}`, {
                state: {
                    bus: selectedBus,
                    from: selectedBus.from,
                    to: selectedBus.to,
                    date: selectedBus.date,
                    departureTime: selectedBus.departureTime,
                    arrivalTime: selectedBus.arrivalTime,
                    price: selectedBus.price,
                    company: selectedBus.company,
                    busType: selectedBus.busType
                }
            });
        }
    };
    const getAmenityIcon = (amenity) => {
        switch (amenity) {
            case 'AC':
                return '❄️';
            case 'WiFi':
                return '📶';
            case 'USB Charging':
                return '🔌';
            case 'Toilet':
                return '🚽';
            case 'Refreshments':
                return '☕';
            default:
                return '✓';
        }
    };
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
    return (_jsx("div", { className: "min-h-screen py-4 sm:py-8 flex flex-col", style: { background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #d4a1fd 100%)' }, children: _jsx("div", { className: "max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full", children: _jsxs("div", { className: "bg-transparent rounded-lg shadow-none p-0", children: [_jsxs("div", { className: "mb-4 sm:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg sm:text-2xl font-bold text-gray-900 drop-shadow", children: "Available Buses" }), _jsxs("p", { className: "mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-700 font-medium drop-shadow", children: [from, " to ", to, " on ", formatDate(date)] })] }), _jsxs("div", { className: "relative", children: [_jsx("label", { htmlFor: "timeFilter", className: "sr-only", children: "Filter by departure time" }), _jsxs("select", { id: "timeFilter", value: selectedTimeRange, onChange: e => setSelectedTimeRange(e.target.value), className: "block w-full py-1.5 sm:py-2 px-3 sm:px-4 pr-8 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-700 bg-white bg-opacity-80 backdrop-blur", children: [_jsx("option", { value: "all", children: "All Times" }), timeRanges.map(range => (_jsx("option", { value: range.label, children: range.label }, range.label)))] })] })] }), isLoading ? (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(LoadingSpinner, {}) })) : filteredBuses.length === 0 ? (_jsxs("div", { className: "text-center text-gray-500 py-12", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx(FaBus, { color: "#BFDBFE", size: 40 }) }), _jsx("p", { className: "text-lg font-semibold", children: "No buses found for your search." }), _jsx("p", { className: "text-sm", children: "Try changing your search criteria." })] })) : (_jsx("div", { className: "flex flex-col gap-2 sm:gap-4 mt-2 sm:mt-4", children: filteredBuses.map(bus => (_jsxs("div", { className: "bg-white bg-opacity-90 rounded-lg shadow border border-gray-100 hover:border-blue-400 transition-all flex flex-col gap-1 p-2 group sm:rounded-2xl sm:shadow-xl sm:gap-4 sm:p-8", children: [_jsxs("div", { className: "flex items-center justify-between gap-2 w-full sm:flex-col sm:items-start sm:gap-4", children: [_jsxs("div", { className: "flex items-center gap-1 sm:gap-3", children: [_jsx("div", { className: "flex items-center justify-center bg-blue-100 rounded w-6 h-6 sm:w-12 sm:h-12", children: _jsx(FaBus, { color: "#3B82F6", size: 14 }) }), _jsx("span", { className: "text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors sm:text-xl", children: bus.company })] }), _jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [_jsx(FaMoneyBillWave, { color: "#22C55E", size: 14 }), _jsxs("span", { className: "text-base font-bold text-gray-900 sm:text-2xl", children: ["K ", bus.price] })] })] }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-1 w-full sm:flex-col sm:items-start sm:gap-2", children: [_jsxs("div", { className: "flex items-center gap-1 text-xs font-medium text-gray-700 sm:text-base sm:gap-2", children: [_jsx("span", { className: "font-bold text-blue-600", children: bus.from }), _jsx("span", { className: "mx-1 text-gray-400 sm:mx-2", children: "\u2192" }), _jsx("span", { className: "font-bold text-green-600", children: bus.to })] }), _jsxs("div", { className: "flex items-center gap-3 text-[11px] text-gray-500 sm:text-sm sm:gap-6", children: [_jsxs("span", { children: [_jsx("span", { className: "font-semibold text-gray-700", children: "Departure:" }), " ", formatTime(bus.departureTime)] }), _jsxs("span", { children: [_jsx("span", { className: "font-semibold text-gray-700", children: "Arrival:" }), " ", formatTime(bus.arrivalTime)] })] })] }), _jsxs("div", { className: "flex items-center justify-between gap-1 w-full mt-1 sm:flex-row sm:gap-4 sm:mt-2", children: [_jsxs("div", { className: "flex items-center gap-1 flex-wrap sm:gap-3", children: [bus.amenities?.includes('WiFi') && _jsx(FaWifi, { color: "#60A5FA", size: 12, title: "WiFi" }), bus.amenities?.includes('AC') && _jsx(FaSnowflake, { color: "#7DD3FC", size: 12, title: "Air Conditioning" }), bus.amenities?.includes('USB Charging') && _jsx(FaPlug, { color: "#F59E42", size: 12, title: "USB Charging" }), bus.amenities?.includes('Refreshments') && _jsx(FaCoffee, { color: "#059669", size: 12, title: "Refreshments" }), _jsx(FaChair, { color: "#9CA3AF", size: 12, title: "Seats" }), _jsxs("span", { className: "text-[10px] text-gray-500 ml-1 sm:text-xs sm:ml-2", children: [bus.availableSeats, " seats"] }), _jsx("span", { className: "ml-2 px-1 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold sm:ml-4 sm:px-2 sm:text-xs", children: bus.busType })] }), _jsx("button", { className: "px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded shadow transition-colors text-xs sm:px-8 sm:py-2 sm:text-base", onClick: () => handleSelectBus(bus.id), children: "Select Seats" })] })] }, bus.id))) }))] }) }) }));
};
