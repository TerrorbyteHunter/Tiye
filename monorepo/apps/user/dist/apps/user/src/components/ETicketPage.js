import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tickets } from '../lib/api';
import ETicket from './ETicket';
import html2pdf from 'html2pdf.js';
import api from '../lib/api';
// Dedicated export/print component for robust PDF export
const ETicketExport = ({ ticket }) => (_jsxs("div", { style: { fontFamily: 'Roboto, Arial, sans-serif', width: 600, margin: '0 auto', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px #0001', padding: 32 }, children: [_jsx("link", { href: "https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap", rel: "stylesheet" }), _jsxs("div", { style: { background: '#2563eb', color: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 700, fontSize: 22, letterSpacing: 1 }, children: "ZAMBIA INTERCITY EXPRESS" }), _jsx("div", { style: { fontWeight: 700, fontSize: 20, marginTop: 8 }, children: "E-Ticket" }), _jsxs("div", { style: { fontSize: 13, opacity: 0.9, marginTop: 2 }, children: ["Booking Ref: ", ticket.bookingReference] })] }), _jsx("div", {})] }), _jsxs("div", { style: { marginBottom: 18 }, children: [_jsx("div", { style: { fontWeight: 700, color: '#2563eb', fontSize: 16, marginBottom: 8 }, children: "Trip Details" }), _jsx("table", { style: { width: '100%', fontSize: 15, marginBottom: 8 }, children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { children: "From:" }), _jsx("td", { style: { fontWeight: 500 }, children: ticket.departure || ticket.route?.departure })] }), _jsxs("tr", { children: [_jsx("td", { children: "To:" }), _jsx("td", { style: { fontWeight: 500 }, children: ticket.destination || ticket.route?.destination })] }), _jsxs("tr", { children: [_jsx("td", { children: "Date:" }), _jsx("td", { children: ticket.travelDate ? new Date(ticket.travelDate).toLocaleDateString('en-GB') : '' })] }), _jsxs("tr", { children: [_jsx("td", { children: "Seat:" }), _jsx("td", { children: ticket.seatNumber })] }), _jsxs("tr", { children: [_jsx("td", { children: "Departure:" }), _jsx("td", { children: ticket.route?.departureTime })] }), _jsxs("tr", { children: [_jsx("td", { children: "Arrival:" }), _jsx("td", { children: ticket.route?.estimatedArrival })] })] }) })] }), _jsxs("div", { style: { marginBottom: 18 }, children: [_jsx("div", { style: { fontWeight: 700, color: '#2563eb', fontSize: 16, marginBottom: 8 }, children: "Payment Details" }), _jsx("table", { style: { width: '100%', fontSize: 15 }, children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { children: "Amount:" }), _jsxs("td", { style: { fontWeight: 700 }, children: ["K ", ticket.amount] })] }), _jsxs("tr", { children: [_jsx("td", { children: "Method:" }), _jsx("td", { children: ticket.paymentMethod || 'Mobile Money' })] }), _jsxs("tr", { children: [_jsx("td", { children: "Passenger:" }), _jsx("td", { children: ticket.customerName })] }), _jsxs("tr", { children: [_jsx("td", { children: "Phone/Email:" }), _jsx("td", { children: ticket.customerPhone || ticket.customerEmail })] })] }) })] }), _jsx("div", { style: { fontWeight: 700, color: '#2563eb', fontSize: 15, marginBottom: 6 }, children: "Important Information" }), _jsxs("ul", { style: { fontSize: 14, color: '#374151', marginBottom: 0, paddingLeft: 18 }, children: [_jsx("li", { children: "Please arrive at the bus station 30 minutes before departure time" }), _jsx("li", { children: "Baggage allowance: 20kg per passenger" }), _jsx("li", { children: "No smoking or alcohol consumption on board" }), _jsx("li", { children: "Pets are not allowed on the bus" })] })] }));
const ETicketPage = () => {
    const { bookingReference } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const ticketRef = useRef(null);
    const exportRef = useRef(null);
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    // const [routeReviews, setRouteReviews] = useState<any[]>([]);
    // const [vendorReviews, setVendorReviews] = useState<any[]>([]);
    useEffect(() => {
        const fetchTicket = async () => {
            setLoading(true);
            setError('');
            try {
                if (typeof bookingReference === 'string') {
                    const response = await tickets.getByReference(bookingReference);
                    let ticketData = response.data;
                    // If vendor name is missing, fetch it using vendorId
                    if (!ticketData.vendorName && ticketData.vendorId) {
                        try {
                            const vendorRes = await api.get(`/vendors/${ticketData.vendorId}`);
                            const vendorName = vendorRes.data.name;
                            ticketData = { ...ticketData, vendorName };
                        }
                        catch (err) {
                            // If vendor fetch fails, fallback to default
                            ticketData = { ...ticketData };
                        }
                    }
                    setTicket(ticketData);
                }
                else {
                    setError('Invalid ticket reference.');
                }
                // Fetch reviews for route and vendor (disabled for now)
                // const [routeRes, vendorRes] = await Promise.all([
                //   api.get(`/reviews/route/${response.data.routeId}`),
                //   api.get(`/reviews/vendor/${response.data.vendorId}`),
                // ]);
                // setRouteReviews(routeRes.data);
                // setVendorReviews(vendorRes.data);
            }
            catch (err) {
                setError('Ticket not found.');
            }
            setLoading(false);
        };
        if (bookingReference)
            fetchTicket();
    }, [bookingReference]);
    // Helper to check if rating is allowed
    const canRate = useCallback(() => {
        if (!ticket)
            return false;
        const arrival = new Date(ticket.route?.estimatedArrival || ticket.estimatedarrival || ticket.arrivalTime);
        return new Date() > arrival && !review;
    }, [ticket, review]);
    // Fetch review for this ticket (if any)
    useEffect(() => {
        const fetchReview = async () => {
            if (!ticket)
                return;
            try {
                const res = await api.get(`/reviews/route/${ticket.routeId}`);
                // Find review for this ticket by this user
                const userReview = Array.isArray(res.data)
                    ? res.data.find((r) => r.ticket_id === ticket.id)
                    : null;
                setReview(userReview);
            }
            catch {
                setReview(null);
            }
        };
        if (ticket)
            fetchReview();
    }, [ticket]);
    useEffect(() => {
        setShowRating(canRate());
    }, [canRate]);
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');
        setSubmitSuccess('');
        try {
            await api.post('/reviews', {
                ticketId: ticket.id,
                routeId: ticket.routeId,
                rating,
                comment,
            });
            setSubmitSuccess('Thank you for your feedback!');
            setShowRating(false);
            setReview({ rating, comment });
        }
        catch (err) {
            setSubmitError(err?.response?.data?.error || 'Failed to submit review.');
        }
        setSubmitting(false);
    };
    const handleExportPDF = async () => {
        if (!exportRef.current)
            return;
        setIsExporting(true);
        try {
            // Wait for fonts to load
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }
            // Wait for images (if any)
            const imgs = exportRef.current.querySelectorAll('img');
            await Promise.all(Array.from(imgs).map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })));
            const opt = {
                margin: 0.5,
                filename: `ticket-${ticket.bookingReference}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            await html2pdf().set(opt).from(exportRef.current).save();
        }
        catch (error) {
            // handle error
        }
        finally {
            setIsExporting(false);
        }
    };
    if (loading)
        return _jsx("div", { className: "p-8", children: "Loading..." });
    if (error)
        return _jsx("div", { className: "p-8 text-red-500", children: error });
    if (!ticket)
        return null;
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("button", { onClick: () => navigate(-1), className: "mb-4 px-4 py-2 bg-gray-200 rounded", children: "Back" }), _jsx("div", { ref: ticketRef, children: _jsx(ETicket, { ticket: ticket }) }), _jsx("div", { ref: exportRef, style: { position: 'absolute', left: '-9999px', top: 0, width: 0, height: 0, overflow: 'hidden' }, "aria-hidden": "true", children: _jsx(ETicketExport, { ticket: ticket }) }), showRating && (_jsxs("form", { onSubmit: handleSubmitReview, className: "mt-8 bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-bold mb-2", children: "Rate this trip" }), _jsx("div", { className: "flex items-center mb-4", children: [1, 2, 3, 4, 5].map(star => (_jsx("button", { type: "button", onClick: () => setRating(star), className: `text-2xl mr-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`, "aria-label": `Rate ${star} star${star > 1 ? 's' : ''}`, children: "\u2605" }, star))) }), _jsx("textarea", { className: "w-full border rounded p-2 mb-4", rows: 3, placeholder: "Leave a comment (optional)", value: comment, onChange: e => setComment(e.target.value) }), _jsx("button", { type: "submit", className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50", disabled: submitting || rating === 0, children: submitting ? 'Submitting...' : 'Submit Review' }), submitError && _jsx("div", { className: "text-red-500 mt-2", children: submitError }), submitSuccess && _jsx("div", { className: "text-green-600 mt-2", children: submitSuccess })] })), review && (_jsxs("div", { className: "mt-8 bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-bold mb-2", children: "Your Rating" }), _jsx("div", { className: "flex items-center mb-2", children: [1, 2, 3, 4, 5].map(star => (_jsx("span", { className: `text-2xl mr-1 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`, children: "\u2605" }, star))) }), review.comment && _jsx("div", { className: "text-gray-700", children: review.comment })] })), _jsx("div", { className: "mt-4 flex justify-end", children: _jsx("button", { onClick: handleExportPDF, disabled: isExporting, className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 print:hidden", children: isExporting ? 'Exporting...' : 'Download' }) })] }) }));
};
export default ETicketPage;
