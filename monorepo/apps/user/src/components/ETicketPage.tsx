import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tickets } from '../lib/api';
import ETicket from './ETicket';
import html2pdf from 'html2pdf.js';
import api from '../lib/api';

// Dedicated export/print component for robust PDF export
const ETicketExport: React.FC<{ ticket: any }> = ({ ticket }) => (
  <div style={{ fontFamily: 'Roboto, Arial, sans-serif', width: 600, margin: '0 auto', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px #0001', padding: 32 }}>
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet" />
    <div style={{ background: '#2563eb', color: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>ZAMBIA INTERCITY EXPRESS</div>
        <div style={{ fontWeight: 700, fontSize: 20, marginTop: 8 }}>E-Ticket</div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>Booking Ref: {ticket.bookingReference}</div>
      </div>
      <div>
        {/* QR code (optional, can use a library or image) */}
      </div>
    </div>
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 16, marginBottom: 8 }}>Trip Details</div>
      <table style={{ width: '100%', fontSize: 15, marginBottom: 8 }}>
        <tbody>
          <tr><td>From:</td><td style={{ fontWeight: 500 }}>{ticket.departure || ticket.route?.departure}</td></tr>
          <tr><td>To:</td><td style={{ fontWeight: 500 }}>{ticket.destination || ticket.route?.destination}</td></tr>
          <tr><td>Date:</td><td>{ticket.travelDate ? new Date(ticket.travelDate).toLocaleDateString('en-GB') : ''}</td></tr>
          <tr><td>Seat:</td><td>{ticket.seatNumber}</td></tr>
          <tr><td>Departure:</td><td>{ticket.route?.departureTime}</td></tr>
          <tr><td>Arrival:</td><td>{ticket.route?.estimatedArrival}</td></tr>
        </tbody>
      </table>
    </div>
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 16, marginBottom: 8 }}>Payment Details</div>
      <table style={{ width: '100%', fontSize: 15 }}>
        <tbody>
          <tr><td>Amount:</td><td style={{ fontWeight: 700 }}>K {ticket.amount}</td></tr>
          <tr><td>Method:</td><td>{ticket.paymentMethod || 'Mobile Money'}</td></tr>
          <tr><td>Passenger:</td><td>{ticket.customerName}</td></tr>
          <tr><td>Phone/Email:</td><td>{ticket.customerPhone || ticket.customerEmail}</td></tr>
        </tbody>
      </table>
    </div>
    <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 15, marginBottom: 6 }}>Important Information</div>
    <ul style={{ fontSize: 14, color: '#374151', marginBottom: 0, paddingLeft: 18 }}>
      <li>Please arrive at the bus station 30 minutes before departure time</li>
      <li>Baggage allowance: 20kg per passenger</li>
      <li>No smoking or alcohol consumption on board</li>
      <li>Pets are not allowed on the bus</li>
    </ul>
  </div>
);

const ETicketPage: React.FC = () => {
  const { bookingReference } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [review, setReview] = useState<any>(null);
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
            } catch (err) {
              // If vendor fetch fails, fallback to default
              ticketData = { ...ticketData };
            }
          }
          setTicket(ticketData);
        } else {
          setError('Invalid ticket reference.');
        }
        // Fetch reviews for route and vendor (disabled for now)
        // const [routeRes, vendorRes] = await Promise.all([
        //   api.get(`/reviews/route/${response.data.routeId}`),
        //   api.get(`/reviews/vendor/${response.data.vendorId}`),
        // ]);
        // setRouteReviews(routeRes.data);
        // setVendorReviews(vendorRes.data);
      } catch (err) {
        setError('Ticket not found.');
      }
      setLoading(false);
    };
    if (bookingReference) fetchTicket();
  }, [bookingReference]);

  // Helper to check if rating is allowed
  const canRate = useCallback(() => {
    if (!ticket) return false;
    const arrival = new Date(ticket.route?.estimatedArrival || ticket.estimatedarrival || ticket.arrivalTime);
    return new Date() > arrival && !review;
  }, [ticket, review]);

  // Fetch review for this ticket (if any)
  useEffect(() => {
    const fetchReview = async () => {
      if (!ticket) return;
      try {
        const res = await api.get(`/reviews/route/${ticket.routeId}`);
        // Find review for this ticket by this user
        const userReview = Array.isArray(res.data)
          ? res.data.find((r: any) => r.ticket_id === ticket.id)
          : null;
        setReview(userReview);
      } catch {
        setReview(null);
      }
    };
    if (ticket) fetchReview();
  }, [ticket]);

  useEffect(() => {
    setShowRating(canRate());
  }, [canRate]);

  const handleSubmitReview = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setSubmitError(err?.response?.data?.error || 'Failed to submit review.');
    }
    setSubmitting(false);
  };

  const handleExportPDF = async () => {
    if (!exportRef.current) return;
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
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
      };
      await html2pdf().set(opt).from(exportRef.current).save();
    } catch (error) {
      // handle error
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-200 rounded">Back</button>
        <div ref={ticketRef}>
          <ETicket ticket={ticket} />
        </div>
        {/* Hidden export/print area: only ETicketExport, no download button or extra UI */}
        <div ref={exportRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
          <ETicketExport ticket={ticket} />
        </div>
        {/* Rating UI */}
        {showRating && (
          <form onSubmit={handleSubmitReview} className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2">Rate this trip</h3>
            <div className="flex items-center mb-4">
              {[1,2,3,4,5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl mr-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >★</button>
              ))}
            </div>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={3}
              placeholder="Leave a comment (optional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={submitting || rating === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            {submitError && <div className="text-red-500 mt-2">{submitError}</div>}
            {submitSuccess && <div className="text-green-600 mt-2">{submitSuccess}</div>}
          </form>
        )}
        {/* Show review if exists */}
        {review && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2">Your Rating</h3>
            <div className="flex items-center mb-2">
              {[1,2,3,4,5].map(star => (
                <span key={star} className={`text-2xl mr-1 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
            {review.comment && <div className="text-gray-700">{review.comment}</div>}
          </div>
        )}
        {/*
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2">Route Reviews</h3>
          <ReviewList reviews={routeReviews} />
          <h3 className="text-lg font-bold mt-6 mb-2">Bus Company Reviews</h3>
          <ReviewList reviews={vendorReviews} />
        </div>
        */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 print:hidden"
          >
            {isExporting ? 'Exporting...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ETicketPage; 