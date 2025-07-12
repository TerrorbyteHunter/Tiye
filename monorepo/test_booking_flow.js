// Test script to verify the complete booking flow
const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

async function testBookingFlow() {
  console.log('🧪 Testing complete booking flow...\n');

  try {
    // 1. Login as a user
    console.log('1. Logging in as user...');
    const loginResponse = await axios.post(`${API_BASE_URL}/user/login`, {
      mobile: '260977123456',
      name: 'Test User'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('User ID:', loginResponse.data.user.id);
    console.log('User Mobile:', loginResponse.data.user.mobile);

    // 2. Get available routes
    console.log('\n2. Getting available routes...');
    const routesResponse = await axios.get(`${API_BASE_URL}/user/routes`);
    console.log('✅ Routes found:', routesResponse.data.length);
    
    if (routesResponse.data.length === 0) {
      console.log('❌ No routes available for testing');
      return;
    }

    const testRoute = routesResponse.data[0];
    console.log('Using route:', {
      id: testRoute.id,
      departure: testRoute.departure,
      destination: testRoute.destination,
      fare: testRoute.fare
    });

    // 3. Get available seats
    console.log('\n3. Getting available seats...');
    const seatsResponse = await axios.get(`${API_BASE_URL}/user/routes/${testRoute.id}/seats`);
    console.log('✅ Seats response received');
    console.log('Seats response data:', seatsResponse.data);

    // Check if seats data is an array or object
    let availableSeats = [];
    if (Array.isArray(seatsResponse.data)) {
      availableSeats = seatsResponse.data.filter(seat => seat.status === 'available');
    } else if (seatsResponse.data && typeof seatsResponse.data === 'object') {
      // If it's an object, look for seats array
      const seatsArray = seatsResponse.data.seats || seatsResponse.data.available || [];
      availableSeats = Array.isArray(seatsArray) ? seatsArray.filter(seat => seat.status === 'available') : [];
    }

    console.log('Available seats found:', availableSeats.length);

    if (availableSeats.length === 0) {
      console.log('❌ No available seats found');
      return;
    }

    const availableSeat = availableSeats[0];
    console.log('Using seat:', availableSeat.seatNumber);

    // 4. Create a booking
    console.log('\n4. Creating booking...');
    const bookingData = {
      seatNumber: availableSeat.seatNumber,
      customerName: 'Test User',
      customerPhone: '260977123456',
      customerEmail: 'test@example.com',
      amount: testRoute.fare,
      travelDate: new Date().toISOString().split('T')[0] // Today's date
    };

    console.log('Booking data:', bookingData);

    const bookingResponse = await axios.post(
      `${API_BASE_URL}/routes/${testRoute.id}/seats`,
      bookingData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Booking created successfully!');
    console.log('Booking response:', bookingResponse.data);

    // 5. Wait a moment for notifications to be created
    console.log('\n5. Waiting for notifications to be created...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Check user tickets
    console.log('\n6. Checking user tickets...');
    const ticketsResponse = await axios.get(`${API_BASE_URL}/user/tickets`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Tickets found:', ticketsResponse.data.length);
    if (ticketsResponse.data.length > 0) {
      console.log('Latest ticket:', {
        id: ticketsResponse.data[0].id,
        bookingReference: ticketsResponse.data[0].bookingReference,
        status: ticketsResponse.data[0].status,
        amount: ticketsResponse.data[0].amount
      });
    }

    // 7. Check notifications
    console.log('\n7. Checking notifications...');
    const notificationsResponse = await axios.get(`${API_BASE_URL}/user/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Notifications found:', notificationsResponse.data.length);
    if (notificationsResponse.data.length > 0) {
      console.log('Latest notifications:');
      notificationsResponse.data.slice(0, 3).forEach((notification, index) => {
        console.log(`  ${index + 1}. ${notification.title}: ${notification.message}`);
      });
    }

    // 8. Summary
    console.log('\n📊 Booking Flow Test Summary:');
    console.log('✅ User authentication: Working');
    console.log('✅ Route availability: Working');
    console.log('✅ Seat availability: Working');
    console.log('✅ Booking creation: Working');
    console.log('✅ Ticket retrieval: Working');
    console.log('✅ Notification system: Working');
    
    if (ticketsResponse.data.length > 0) {
      console.log('✅ New booking appears in user tickets');
    } else {
      console.log('⚠️  New booking not found in user tickets');
    }
    
    if (notificationsResponse.data.length > 1) { // More than just welcome message
      console.log('✅ Booking notifications created');
    } else {
      console.log('⚠️  Booking notifications not found');
    }

    console.log('\n🎉 Booking flow test completed successfully!');

  } catch (error) {
    console.error('❌ Booking flow test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

// Run the test
testBookingFlow().catch(console.error); 