import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './TicketReceipt.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface TicketReceiptProps {
  ticket: {
    id: number;
    passengerName: string;
    customerName?: string;
    phone: string;
    email?: string;
    seatNumber: number;
    amount: number;
    createdAt: string;
    route: {
      departure: string;
      destination: string;
      departureTime: string;
      fare: number;
      busType?: string;
    };
  };
  onClose: () => void;
}

export default function TicketReceipt({ ticket, onClose }: TicketReceiptProps) {
  const handleDownload = async () => {
    const receiptElement = document.querySelector('.receipt-content');
    if (!receiptElement) return;

    try {
      const receiptContent = receiptElement as HTMLElement;
      const originalStyle = receiptContent.style.cssText;

      // Set temporary styles for better PDF capture
      receiptContent.style.width = '595px'; // A5 width in pixels
      receiptContent.style.margin = '0';
      receiptContent.style.padding = '40px';
      receiptContent.style.boxSizing = 'border-box';
      receiptContent.style.background = 'white';

      const canvas = await html2canvas(receiptContent, {
        useCORS: true,
        logging: false
      });

      // Restore original styles
      receiptContent.style.cssText = originalStyle;

      // Create PDF with pixel dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [595, 842] // A5 dimensions in pixels
      });

      // Calculate dimensions to fit content properly
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Use the canvas dimensions directly
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      
      // Center the content vertically
      const yOffset = Math.max(0, (pageHeight - imgHeight) / 2);

      // Add the image with high quality
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        0,
        yOffset,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );

      const date = new Date().toISOString().split('T')[0];
      const filename = `ticket_${ticket.id}_${date}.pdf`;
      
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (!ticket || !ticket.route) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="text-center text-red-600">
            Error: Invalid ticket data
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const arrivalTime = new Date(ticket.route.departureTime);
  arrivalTime.setHours(arrivalTime.getHours() + 3); // Assuming 3 hours journey time

  const name = ticket.passengerName || ticket.customerName || 'Unknown';

  // Create QR code data
  const qrData = JSON.stringify({
    ticketId: ticket.id,
    passengerName: name,
    seatNumber: ticket.seatNumber,
    departure: ticket.route.departure,
    destination: ticket.route.destination,
    departureTime: ticket.route.departureTime,
    phone: ticket.phone
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[400px] receipt-wrapper">
        {/* Actions */}
        <div className="p-3 border-b">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="receipt-content p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Mazhandu Family</h1>
            <p className="text-sm text-gray-600">Bus Services</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Booking Confirmation</h2>
            <p className="text-sm text-gray-600">Ticket #{ticket.id}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Passenger</p>
                <p className="font-medium text-lg">{name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Seat</p>
                <p className="font-medium text-lg">{ticket.seatNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">From</p>
                <p className="font-medium text-lg">{ticket.route.departure}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">To</p>
                <p className="font-medium text-lg">{ticket.route.destination}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Departure</p>
                <p className="font-medium">
                  {new Date(ticket.route.departureTime).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                  <br />
                  {new Date(ticket.route.departureTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Arrival (Est.)</p>
                <p className="font-medium">
                  {arrivalTime.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                  <br />
                  {arrivalTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Bus Type</p>
                <p className="font-medium text-lg">{ticket.route.busType || 'Luxury'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount Paid</p>
                <p className="font-medium text-lg">ZMW {Number(ticket.amount).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-sm font-medium text-gray-700 mb-4">Amenities</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">WiFi Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">AC Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">Charging Ports</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">Refreshments</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-sm text-gray-600 mb-4">Scan QR Code to verify ticket</p>
            <div className="flex justify-center items-center bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={qrData}
                size={120}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
            <p className="font-medium">Thank you for choosing Mazhandu Family Bus Services!</p>
            <p className="mt-2">Please arrive at least 30 minutes before departure time.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 