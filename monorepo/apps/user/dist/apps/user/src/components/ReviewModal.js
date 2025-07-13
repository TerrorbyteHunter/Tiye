import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import api from '../lib/api';
const ReviewModal = ({ ticket, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/reviews', {
                routeId: ticket.routeId || ticket.route?.id,
                vendorId: ticket.vendorId || ticket.vendor?.id,
                ticketId: ticket.id,
                rating,
                review,
            });
            onSubmit();
        }
        catch (err) {
            setError('Failed to submit review.');
        }
        setLoading(false);
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative", children: [_jsx("button", { className: "absolute top-2 right-2 text-gray-400 hover:text-gray-600", onClick: onClose, children: "\u00D7" }), _jsx("h2", { className: "text-xl font-bold mb-4", children: "Leave a Review" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-medium mb-1", children: "Rating" }), _jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4, 5].map(star => (_jsx("button", { type: "button", className: `text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`, onClick: () => setRating(star), "aria-label": `Rate ${star} star${star > 1 ? 's' : ''}`, children: "\u2605" }, star))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-medium mb-1", children: "Review (optional)" }), _jsx("textarea", { value: review, onChange: e => setReview(e.target.value), className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400", rows: 4, placeholder: "Share your experience..." })] }), error && _jsx("div", { className: "text-red-600 text-sm", children: error }), _jsxs("div", { className: "flex gap-2 mt-4", children: [_jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", disabled: loading || rating === 0, children: loading ? 'Submitting...' : 'Submit Review' }), _jsx("button", { type: "button", className: "px-4 py-2 bg-gray-200 rounded", onClick: onClose, disabled: loading, children: "Cancel" })] })] })] }) }));
};
export default ReviewModal;
