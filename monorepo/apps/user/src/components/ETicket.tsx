// If you see a linter error for 'react-icons', run: npm install react-icons
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaBus, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChair, FaMoneyBillWave, FaUser } from 'react-icons/fa';

const ETicket: React.FC<{ ticket: any; onDownload?: () => void; isExporting?: boolean }> = ({ ticket, onDownload, isExporting }) => {
  if (!ticket) return null;
  // Helper to format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  // Helper to format time as HH:mm
  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden max-w-2xl mx-auto">
      {/* Header with vendor name and logo */}
      <div className="bg-blue-600 text-white px-8 py-6 flex items-center justify-between">
        <div>
          <div className="text-lg font-bold tracking-wide uppercase">{ticket.vendorName || ticket.vendor_name || 'Bus Company'}</div>
          <div className="text-2xl font-extrabold mt-1">E-Ticket</div>
          <div className="text-xs opacity-80 mt-1">Booking Ref: <span className="font-mono">{ticket.bookingReference}</span></div>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-md border border-blue-200">
          <QRCodeSVG
            value={`${window.location.origin}/verify-ticket/${ticket.bookingReference}`}
            size={90}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>
      {/* Main content */}
      <div className="px-4 sm:px-8 py-4 sm:py-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        {/* Trip Details */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 flex items-center gap-1 sm:gap-2 text-blue-700"><FaBus size={16} /> Trip Details</h3>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-base text-gray-700">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <div className="flex items-center gap-1 sm:gap-2"><FaMapMarkerAlt color="#3B82F6" size={14} /> <span>From:</span> <span className="font-medium">{ticket.departure || ticket.route?.departure}</span></div>
              <div className="flex items-center gap-1 sm:gap-2"><FaMapMarkerAlt color="#22C55E" size={14} /> <span>To:</span> <span className="font-medium">{ticket.destination || ticket.route?.destination}</span></div>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <div className="flex items-center gap-1 sm:gap-2"><FaCalendarAlt color="#6366F1" size={14} /> <span>Date:</span> <span className="font-medium">{formatDate(ticket.travelDate || ticket.bookingDate)}</span></div>
              <div className="flex items-center gap-1 sm:gap-2"><FaChair color="#A78BFA" size={14} /> <span>Seat:</span> <span className="font-medium text-base sm:text-lg">{ticket.seatNumber}</span></div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2"><FaClock color="#F59E0B" size={14} /> <span>Departure:</span> <span className="font-medium">{formatTime(ticket.route?.departureTime || ticket.departureTime)}</span></div>
            <div className="flex items-center gap-1 sm:gap-2"><FaClock color="#34D399" size={14} /> <span>Arrival:</span> <span className="font-medium">{formatTime(ticket.route?.estimatedArrival)}</span></div>
          </div>
        </div>
        {/* Payment Details */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 flex items-center gap-1 sm:gap-2 text-blue-700"><FaMoneyBillWave size={16} /> Payment Details</h3>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-base text-gray-700">
            <div className="flex items-center gap-1 sm:gap-2"><FaMoneyBillWave color="#22C55E" size={14} /> <span>Amount:</span> <span className="font-bold text-base sm:text-lg">K {ticket.amount}</span></div>
            <div className="flex items-center gap-1 sm:gap-2"><span className="font-medium">Method:</span> <span>{ticket.paymentMethod || 'Mobile Money'}</span></div>
            <div className="flex items-center gap-1 sm:gap-2"><FaUser color="#6366F1" size={14} /> <span>Passenger:</span> <span>{ticket.customerName}</span></div>
            <div className="flex items-center gap-1 sm:gap-2"><span className="font-medium">Phone/Email:</span> <span>{ticket.customerPhone || ticket.customerEmail}</span></div>
          </div>
        </div>
      </div>
      {/* Important Info */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-8 py-3 sm:py-6">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-blue-700">Important Information</h3>
        <ul className="list-disc list-inside space-y-1 text-xs sm:text-base text-gray-600">
          <li>Please arrive at the bus station 30 minutes before departure time</li>
          <li>Baggage allowance: 20kg per passenger</li>
          <li>No smoking or alcohol consumption on board</li>
          <li>Pets are not allowed on the bus</li>
        </ul>
      </div>
      {onDownload && (
        <div className="mt-2 sm:mt-4 flex justify-end px-4 sm:px-8 pb-3 sm:pb-6">
          <button
            onClick={onDownload}
            disabled={isExporting}
            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs sm:text-base"
          >
            {isExporting ? 'Exporting...' : 'Download'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ETicket; 