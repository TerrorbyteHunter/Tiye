import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QRCodeSVG } from 'qrcode.react';
import { FaBus, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChair, FaMoneyBillWave, FaUser } from 'react-icons/fa';
const ETicket = ({ ticket, onDownload, isExporting }) => {
    if (!ticket)
        return null;
    // Helper to format date
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
    // Helper to format time as HH:mm, combining date and time if needed
    const formatTime = (dateString, timeString) => {
        if (!timeString)
            return '';
        // If timeString is already a full ISO string, use it directly
        let dateObj;
        if (timeString.length > 8) {
            dateObj = new Date(timeString);
        }
        else if (dateString) {
            // Combine date and time (e.g., 2025-07-17 + 04:00:00)
            dateObj = new Date(`${dateString}T${timeString}`);
        }
        else {
            // Fallback: try parsing time only (will be invalid)
            dateObj = new Date(timeString);
        }
        if (isNaN(dateObj.getTime()))
            return '';
        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };
    return (_jsxs("div", { className: "bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden max-w-2xl mx-auto", children: [_jsxs("div", { className: "bg-blue-600 text-white px-8 py-6 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-lg font-bold tracking-wide uppercase", children: ticket.vendorName || ticket.vendor_name || 'Bus Company' }), _jsx("div", { className: "text-2xl font-extrabold mt-1", children: "E-Ticket" }), _jsxs("div", { className: "text-xs opacity-80 mt-1", children: ["Booking Ref: ", _jsx("span", { className: "font-mono", children: ticket.bookingReference })] })] }), _jsx("div", { className: "bg-white p-2 rounded-lg shadow-md border border-blue-200", children: _jsx(QRCodeSVG, { value: `${window.location.origin}/verify-ticket/${ticket.bookingReference}`, size: 90, level: "H", includeMargin: true }) })] }), _jsxs("div", { className: "px-4 sm:px-8 py-4 sm:py-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-base sm:text-lg font-semibold mb-2 sm:mb-4 flex items-center gap-1 sm:gap-2 text-blue-700", children: [_jsx(FaBus, { size: 16 }), " Trip Details"] }), _jsxs("div", { className: "space-y-2 sm:space-y-3 text-xs sm:text-base text-gray-700", children: [_jsxs("div", { className: "flex flex-wrap gap-1 sm:gap-2", children: [_jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [_jsx(FaMapMarkerAlt, { color: "#3B82F6", size: 14 }), " ", _jsx("span", { children: "From:" }), " ", _jsx("span", { className: "font-medium", children: ticket.departure || ticket.route?.departure })] }), _jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [_jsx(FaMapMarkerAlt, { color: "#22C55E", size: 14 }), " ", _jsx("span", { children: "To:" }), " ", _jsx("span", { className: "font-medium", children: ticket.destination || ticket.route?.destination })] })] }), _jsxs("div", { className: "flex flex-wrap gap-1 sm:gap-2", children: [_jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [_jsx(FaCalendarAlt, { color: "#6366F1", size: 14 }), " ", _jsx("span", { children: "Date:" }), " ", _jsx("span", { className: "font-medium", children: formatDate(ticket.travelDate || ticket.bookingDate) })] }), _jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [_jsx(FaChair, { color: "#A78BFA", size: 14 }), " ", _jsx("span", { children: "Seat:" }), " ", _jsx("span", { className: "font-medium text-base sm:text-lg", children: ticket.seatNumber })] })] }), _jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [_jsx(FaClock, { color: "#F59E0B", size: 14 }), " ", _jsx("span", { children: "Departure:" }), " ", _jsx("span", { className: "font-medium", children: formatTime(ticket.travelDate || ticket.bookingDate, ticket.route?.departureTime || ticket.departureTime) })] }), _jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [_jsx(FaClock, { color: "#34D399", size: 14 }), " ", _jsx("span", { children: "Arrival:" }), " ", _jsx("span", { className: "font-medium", children: formatTime(ticket.travelDate || ticket.bookingDate, ticket.route?.estimatedArrival) })] })] })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-base sm:text-lg font-semibold mb-2 sm:mb-4 flex items-center gap-1 sm:gap-2 text-blue-700", children: [_jsx(FaMoneyBillWave, { size: 16 }), " Payment Details"] }), _jsxs("div", { className: "space-y-2 sm:space-y-3 text-xs sm:text-base text-gray-700", children: [_jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [_jsx(FaMoneyBillWave, { color: "#22C55E", size: 14 }), " ", _jsx("span", { children: "Amount:" }), " ", _jsxs("span", { className: "font-bold text-base sm:text-lg", children: ["K ", ticket.amount] })] }), _jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [_jsx("span", { className: "font-medium", children: "Method:" }), " ", _jsx("span", { children: ticket.paymentMethod || 'Mobile Money' })] }), _jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [_jsx(FaUser, { color: "#6366F1", size: 14 }), " ", _jsx("span", { children: "Passenger:" }), " ", _jsx("span", { children: ticket.customerName })] }), _jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [_jsx("span", { className: "font-medium", children: "Phone/Email:" }), " ", _jsx("span", { children: ticket.customerPhone || ticket.customerEmail })] })] })] })] }), _jsxs("div", { className: "bg-gray-50 border-t border-gray-200 px-4 sm:px-8 py-3 sm:py-6", children: [_jsx("h3", { className: "text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-blue-700", children: "Important Information" }), _jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs sm:text-base text-gray-600", children: [_jsx("li", { children: "Please arrive at the bus station 30 minutes before departure time" }), _jsx("li", { children: "Baggage allowance: 20kg per passenger" }), _jsx("li", { children: "No smoking or alcohol consumption on board" }), _jsx("li", { children: "Pets are not allowed on the bus" })] })] }), onDownload && (_jsx("div", { className: "mt-2 sm:mt-4 flex justify-end px-4 sm:px-8 pb-3 sm:pb-6", children: _jsx("button", { onClick: onDownload, disabled: isExporting, className: "px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs sm:text-base", children: isExporting ? 'Exporting...' : 'Download' }) }))] }));
};
export default ETicket;
