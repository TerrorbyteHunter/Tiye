import React, { useState } from 'react';
import api from '../lib/api';

const ReviewModal: React.FC<{ ticket: any; onClose: () => void; onSubmit: () => void }> = ({ ticket, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError('Failed to submit review.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Leave a Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Rating</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(star => (
                <button
                  type="button"
                  key={star}
                  className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >★</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Review (optional)</label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={4}
              placeholder="Share your experience..."
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading || rating === 0}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onClose} disabled={loading}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal; 