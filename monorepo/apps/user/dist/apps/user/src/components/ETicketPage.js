import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tickets } from '../lib/api';
import ETicket from './ETicket';
import html2pdf from 'html2pdf.js';
import api from '../lib/api';
const ETicketPage = () => {
    const { bookingReference } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const ticketRef = useRef(null);
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
        if (!ticketRef.current)
            return;
        setIsExporting(true);
        try {
            const opt = {
                margin: 1,
                filename: `ticket-${ticket.bookingReference}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            await html2pdf().set(opt).from(ticketRef.current).save();
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
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("button", { onClick: () => navigate(-1), className: "mb-4 px-4 py-2 bg-gray-200 rounded", children: "Back" }), _jsx("div", { ref: ticketRef, children: _jsx(ETicket, { ticket: ticket }) }), showRating && (_jsxs("form", { onSubmit: handleSubmitReview, className: "mt-8 bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-bold mb-2", children: "Rate this trip" }), _jsx("div", { className: "flex items-center mb-4", children: [1, 2, 3, 4, 5].map(star => (_jsx("button", { type: "button", onClick: () => setRating(star), className: `text-2xl mr-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`, "aria-label": `Rate ${star} star${star > 1 ? 's' : ''}`, children: "\u2605" }, star))) }), _jsx("textarea", { className: "w-full border rounded p-2 mb-4", rows: 3, placeholder: "Leave a comment (optional)", value: comment, onChange: e => setComment(e.target.value) }), _jsx("button", { type: "submit", className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50", disabled: submitting || rating === 0, children: submitting ? 'Submitting...' : 'Submit Review' }), submitError && _jsx("div", { className: "text-red-500 mt-2", children: submitError }), submitSuccess && _jsx("div", { className: "text-green-600 mt-2", children: submitSuccess })] })), review && (_jsxs("div", { className: "mt-8 bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-bold mb-2", children: "Your Rating" }), _jsx("div", { className: "flex items-center mb-2", children: [1, 2, 3, 4, 5].map(star => (_jsx("span", { className: `text-2xl mr-1 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`, children: "\u2605" }, star))) }), review.comment && _jsx("div", { className: "text-gray-700", children: review.comment })] })), _jsx("div", { className: "mt-4 flex justify-end", children: _jsx("button", { onClick: handleExportPDF, disabled: isExporting, className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50", children: isExporting ? 'Exporting...' : 'Download' }) })] }) }));
};
export default ETicketPage;
