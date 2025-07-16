import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2pdf from 'html2pdf.js';
import { BackButton } from './shared/BackButton';
import { RouteMap } from './shared/RouteMap';
import { EmergencyContacts } from './shared/EmergencyContacts';
import { routes as routesApi } from '../lib/api';
import ETicket from './ETicket';

interface LocationState {
  selectedSeats: number[];
  totalPrice: number;
  busId: string;
  busData: {
    bus: {
      id: string;
      company: string;
      from: string;
      to: string;
      date: string;
      departureTime: string;
      arrivalTime: string;
      price: number;
      busType: string;
    };
  };
  phoneNumber: string;
}

// Helper to format time as HH:mm
const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [stops, setStops] = useState<any[]>([]);

  const state = location.state as LocationState;
  if (!state || !state.busData) {
    navigate('/');
    return null;
  }

  const { busData, selectedSeats, totalPrice, phoneNumber } = state;
  const { bus } = busData;

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Generate booking reference
  const bookingRef = `TKT${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Get user info from localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();
  // Robust fallback for userName
  const userName = user.name || user.fullName || user.username || user.mobile || 'Customer';

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const response = await routesApi.getById(Number(bus.id));
        setStops(response.data.stops || []);
      } catch (error) {
        setStops([]);
      }
    };
    fetchStops();
  }, [bus.id]);

  // This should fetch emergency contacts from the API
  // For now, return empty array until API endpoint is implemented
  const emergencyContacts: Array<{ name: string; phone: string; type: string }> = [];

  const handleExportPDF = async () => {
    if (!ticketRef.current) return;
    
    setIsExporting(true);
    try {
      const opt = {
        margin: 1,
        filename: `ticket-${bookingRef}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(ticketRef.current).save();
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="mb-4 sm:mb-8" />
        {/* Only render the ETicket/receipt, not the sidebar */}
        <div className="space-y-4 sm:space-y-6">
          <div ref={ticketRef}>
            <ETicket ticket={{
              bookingReference: bookingRef,
              departure: bus.from,
              destination: bus.to,
              travelDate: bus.date,
              seatNumber: selectedSeats.join(', '),
              amount: totalPrice,
              paymentMethod: 'Mobile Money',
              customerPhone: phoneNumber,
              customerName: userName, // Add passenger name
              vendorName: bus.company, // Add vendor name
              route: { 
                departureTime: bus.departureTime,
                estimatedArrival: bus.arrivalTime // Add arrival time
              }
            }} onDownload={handleExportPDF} isExporting={isExporting} />
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              Book Another Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 