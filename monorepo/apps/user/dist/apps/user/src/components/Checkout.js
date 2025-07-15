import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { tickets } from '../lib/api';
import { PaymentTesting } from './PaymentTesting';
export function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState('');
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [showPaymentTesting, setShowPaymentTesting] = useState(false);
    const [paymentResponse, setPaymentResponse] = useState(null);
    const state = location.state;
    if (!state || !state.busData) {
        navigate('/');
        return null;
    }
    const { busData, selectedSeats, totalPrice } = state;
    const { bus } = busData;
    // Timer effect
    useEffect(() => {
        if (isProcessing)
            return; // Don't count down while processing
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
    const formatTimer = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
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
    // Get user info from localStorage
    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        }
        catch {
            return {};
        }
    })();
    // Robust fallback for userName
    const userName = user.name || user.fullName || user.username || user.mobile || 'Customer';
    const userPhone = user.mobile || user.phone || user.username || '';
    const userEmail = user.email || '';
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Pre-check for required fields
        if (!bus.date || !userName) {
            alert('Missing travel date or customer name. Please go back and select your trip again.');
            return;
        }
        setIsProcessing(true);
        let bookingError = '';
        let successfulBookings = 0;
        let bookedTicketIds = [];
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
                        vendorId: bus.vendorId ? Number(bus.vendorId) : 1,
                        customerName: userName,
                        customerPhone: userPhone || userEmail,
                        seatNumber,
                        status: 'paid', // Always mark as paid for testing/demo
                        amount: bus.price,
                        paymentMethod: 'cash',
                        travelDate: bus.date, // Send as string, not Date object
                        bookingDate: new Date(),
                        routeId: Number(bus.id),
                    });
                    console.log('Booking response:', response.data);
                    bookedTicketIds.push(response.data.id);
                    successfulBookings++;
                }
                catch (err) {
                    console.error('Booking error:', err);
                    if (err.response && err.response.data && err.response.data.error) {
                        bookingError = err.response.data.error;
                    }
                    else {
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
        }
        catch (error) {
            console.error('Booking failed:', error);
            alert('Booking failed. Please try again.');
            setIsProcessing(false);
        }
        setIsProcessing(false);
    };
    const handlePaymentComplete = (response) => {
        setPaymentResponse(response);
        if (response.status === 'success') {
            // Process successful payment
            handleSubmit({ preventDefault: () => { } });
        }
        else if (response.status === 'failed') {
            alert(response.message);
            setIsProcessing(false);
        }
        else if (response.status === 'pending') {
            alert(response.message);
            setIsProcessing(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-4 sm:py-8", children: _jsxs("div", { className: "max-w-lg mx-auto px-2 sm:px-6 lg:px-8", children: [_jsx("div", { className: "mb-4 sm:mb-8" }), _jsx("div", { className: "mb-2 sm:mb-4 flex justify-center", children: _jsxs("div", { className: "bg-yellow-100 text-yellow-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-lg", children: ["Complete payment within: ", _jsx("span", { children: formatTimer(timer) })] }) }), _jsxs("div", { className: "bg-white rounded-lg shadow p-3 sm:p-6 mb-3 sm:mb-6", children: [_jsx("h2", { className: "text-base sm:text-xl font-bold mb-2 sm:mb-4", children: "Confirm Booking" }), _jsxs("div", { className: "space-y-1 sm:space-y-2 text-xs sm:text-base", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Name:" }), " ", userName] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Phone:" }), " ", userPhone] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "From:" }), " ", bus.from] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "To:" }), " ", bus.to] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Date:" }), " ", formatDate(bus.date)] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Time:" }), " ", bus.departureTime] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Bus:" }), " ", bus.company, bus.busType && bus.busType !== 'Standard' && ` - ${bus.busType}`] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Selected Seats:" }), " ", selectedSeats.join(', ')] }), _jsxs("div", { className: "font-bold mt-2 sm:mt-4", children: ["Total Price: ", _jsxs("span", { className: "text-blue-600", children: ["K ", totalPrice] })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-3 sm:p-6", children: [_jsxs("h2", { className: "text-base sm:text-xl font-bold mb-2 sm:mb-4 flex items-center justify-between", children: ["Payment Options ", _jsx("span", { className: "text-xs sm:text-sm text-blue-600 cursor-pointer", onClick: () => setShowPaymentTesting(!showPaymentTesting), children: "Show Testing" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-2 sm:space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs sm:text-sm font-semibold mb-1", children: "Phone Number" }), _jsx("input", { type: "text", className: "form-input text-xs sm:text-base py-1.5 sm:py-2", value: phoneNumber, onChange: e => setPhoneNumber(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs sm:text-sm font-semibold mb-1", children: "PIN" }), _jsx("input", { type: "password", className: "form-input text-xs sm:text-base py-1.5 sm:py-2", value: pin, onChange: e => setPin(e.target.value), required: true })] }), _jsx("button", { type: "submit", className: "w-full py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-base font-bold rounded-lg shadow-md transition-colors disabled:opacity-50", disabled: isProcessing, children: isProcessing ? 'Processing...' : 'Pay Now' })] }), showPaymentTesting && _jsx(PaymentTesting, { onPaymentComplete: handlePaymentComplete, amount: totalPrice, customerName: userName, customerEmail: userEmail, bookingReference: `BK${Date.now()}` })] })] }) }));
}
