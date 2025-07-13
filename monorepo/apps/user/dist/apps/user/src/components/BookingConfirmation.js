import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { routes as routesApi } from '../lib/api';
import ETicket from './ETicket';
// Helper to format time as HH:mm
const formatTime = (timeString) => {
    if (!timeString)
        return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};
export const BookingConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const ticketRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [stops, setStops] = useState([]);
    const state = location.state;
    if (!state || !state.busData) {
        navigate('/');
        return null;
    }
    const { busData, selectedSeats, totalPrice, phoneNumber } = state;
    const { bus } = busData;
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
    // Generate booking reference
    const bookingRef = `TKT${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    useEffect(() => {
        const fetchStops = async () => {
            try {
                const response = await routesApi.getById(Number(bus.id));
                setStops(response.data.stops || []);
            }
            catch (error) {
                setStops([]);
            }
        };
        fetchStops();
    }, [bus.id]);
    // This should fetch emergency contacts from the API
    // For now, return empty array until API endpoint is implemented
    const emergencyContacts = [];
    const handleExportPDF = async () => {
        if (!ticketRef.current)
            return;
        setIsExporting(true);
        try {
            const opt = {
                margin: 1,
                filename: `ticket-${bookingRef}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            await html2pdf().set(opt).from(ticketRef.current).save();
        }
        catch (error) {
            console.error('Error exporting PDF:', error);
        }
        finally {
            setIsExporting(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-4 sm:py-8", children: _jsxs("div", { className: "max-w-3xl mx-auto px-2 sm:px-4 lg:px-8", children: [_jsx("div", { className: "mb-4 sm:mb-8" }), _jsxs("div", { className: "space-y-4 sm:space-y-6", children: [_jsx("div", { ref: ticketRef, children: _jsx(ETicket, { ticket: {
                                    bookingReference: bookingRef,
                                    departure: bus.from,
                                    destination: bus.to,
                                    travelDate: bus.date,
                                    seatNumber: selectedSeats.join(', '),
                                    amount: totalPrice,
                                    paymentMethod: 'Mobile Money',
                                    customerPhone: phoneNumber,
                                    route: { departureTime: bus.departureTime }
                                }, onDownload: handleExportPDF, isExporting: isExporting }) }), _jsx("div", { className: "flex justify-center", children: _jsx("button", { onClick: () => navigate('/'), className: "px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base", children: "Book Another Trip" }) })] })] }) }));
};
