import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BackButton } from './shared/BackButton';
import api, { tickets } from '../lib/api';
import { PaymentTesting } from './PaymentTesting';
import { PaymentResponse } from '../lib/flutterwave';

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
}

export function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [showPaymentTesting, setShowPaymentTesting] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);

  const state = location.state as LocationState;
  if (!state || !state.busData) {
    navigate('/');
    return null;
  }

  const { busData, selectedSeats, totalPrice } = state;
  const { bus } = busData;

  // Timer effect
  useEffect(() => {
    if (isProcessing) return; // Don't count down while processing
    if (timer <= 0) {
      alert('Payment time expired. Please select your seats again.');
      navigate(-1); // Go back to seat selection
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, isProcessing, navigate]);

  // Format timer as MM:SS
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
  const userPhone = user.mobile || user.phone || user.username || '';
  const userEmail = user.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Pre-check for required fields
    if (!bus.date || !userName) {
      alert('Missing travel date or customer name. Please go back and select your trip again.');
      return;
    }
    setIsProcessing(true);
    let bookingError = '';
    let successfulBookings = 0;
    let bookedTicketIds: number[] = [];
    
    try {
      // Simulate payment processing using phoneNumber and pin (not sent to backend)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Book each selected seat using logged-in user's info
      for (const seatNumber of selectedSeats) {
        try {
          console.log('Booking seat with travelDate:', bus.date);
          const response = await tickets.create({
            userId: user.id, // Ensure userId is included
            bookingReference: `BK${Date.now()}${seatNumber}`,
            vendorId: (bus as any).vendorId ? Number((bus as any).vendorId) : 1,
            customerName: userName,
            customerPhone: userPhone || userEmail,
            seatNumber,
            status: 'paid', // Always mark as paid for testing/demo
            amount: bus.price,
            paymentMethod: 'cash',
            travelDate: bus.date, // Send as string, not Date object
            bookingDate: new Date(),
            routeId: Number(bus.id),
          } as any);
          console.log('Booking response:', response.data);
          bookedTicketIds.push(response.data.id);
          successfulBookings++;
        } catch (err: any) {
          console.error('Booking error:', err);
          if (err.response && err.response.data && err.response.data.error) {
            bookingError = err.response.data.error;
          } else {
            bookingError = 'Failed to book seat.';
          }
          break;
        }
      }
      
      if (bookingError) {
        alert(bookingError);
        setIsProcessing(false);
        return;
      }

      // If payment was successful, update ticket status to 'paid'
      // For testing/demo, always mark as paid, so skip this block
      // if (paymentResponse && paymentResponse.status === 'success') {
      //   for (const ticketId of bookedTicketIds) {
      //     try {
      //       await tickets.updateStatus(ticketId, 'paid');
      //     } catch (err) {
      //       console.error('Failed to update ticket status to paid:', err);
      //     }
      //   }
      // }
      
      // Show success message
      if (successfulBookings > 0) {
        alert(`Successfully booked ${successfulBookings} seat(s)! You will receive a confirmation shortly.`);
      }
      
      // Navigate to confirmation with all the booking details
      navigate('/booking-confirmation', {
        state: {
          selectedSeats,
          totalPrice,
          busId: bus.id,
          busData: {
            bus: {
              ...bus
            }
          },
          phoneNumber: userPhone || userEmail
        }
      });
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
      setIsProcessing(false);
    }
    setIsProcessing(false);
  };

  const handlePaymentComplete = (response: PaymentResponse) => {
    setPaymentResponse(response);
    
    if (response.status === 'success') {
      // Process successful payment
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    } else if (response.status === 'failed') {
      alert(response.message);
      setIsProcessing(false);
    } else if (response.status === 'pending') {
      alert(response.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-lg mx-auto px-2 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-8" />

        {/* Timer */}
        <div className="mb-2 sm:mb-4 flex justify-center">
          <div className="bg-yellow-100 text-yellow-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-lg">
            Complete payment within: <span>{formatTimer(timer)}</span>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-6 mb-3 sm:mb-6">
          <h2 className="text-base sm:text-xl font-bold mb-2 sm:mb-4">Confirm Booking</h2>
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-base">
            <div><span className="font-semibold">Name:</span> {userName}</div>
            <div><span className="font-semibold">Phone:</span> {userPhone}</div>
            <div><span className="font-semibold">From:</span> {bus.from}</div>
            <div><span className="font-semibold">To:</span> {bus.to}</div>
            <div><span className="font-semibold">Date:</span> {formatDate(bus.date)}</div>
            <div><span className="font-semibold">Time:</span> {bus.departureTime}</div>
            <div><span className="font-semibold">Bus:</span> {bus.company}{bus.busType && bus.busType !== 'Standard' && ` - ${bus.busType}`}</div>
            <div><span className="font-semibold">Selected Seats:</span> {selectedSeats.join(', ')}</div>
            <div className="font-bold mt-2 sm:mt-4">Total Price: <span className="text-blue-600">K {totalPrice}</span></div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-6">
          <h2 className="text-base sm:text-xl font-bold mb-2 sm:mb-4 flex items-center justify-between">Payment Options <span className="text-xs sm:text-sm text-blue-600 cursor-pointer" onClick={() => setShowPaymentTesting(!showPaymentTesting)}>Show Testing</span></h2>
          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                className="form-input text-xs sm:text-base py-1.5 sm:py-2"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1">PIN</label>
              <input
                type="password"
                className="form-input text-xs sm:text-base py-1.5 sm:py-2"
                value={pin}
                onChange={e => setPin(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-base font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          </form>
          {showPaymentTesting && <PaymentTesting onPaymentComplete={handlePaymentComplete} amount={totalPrice} customerName={userName} customerEmail={userEmail} bookingReference={`BK${Date.now()}`} />}
        </div>
      </div>
    </div>
  );
} 