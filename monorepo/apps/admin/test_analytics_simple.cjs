const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAnalyticsSimple() {
  try {
    console.log('Testing Analytics Endpoints (Simple)...\n');

    // Test revenue endpoint
    console.log('1. Testing revenue endpoint...');
    try {
      const revenueResponse = await axios.get(`${BASE_URL}/analytics/dashboard/revenue?period=30`);
      console.log('✅ Revenue data:', revenueResponse.data);
    } catch (error) {
      console.log('❌ Revenue endpoint error:', error.response?.status, error.response?.data?.message || error.message);
    }
    console.log('');

    // Test vendors endpoint
    console.log('2. Testing vendors endpoint...');
    try {
      const vendorsResponse = await axios.get(`${BASE_URL}/analytics/dashboard/vendors?period=30`);
      console.log('✅ Vendors data:', vendorsResponse.data);
    } catch (error) {
      console.log('❌ Vendors endpoint error:', error.response?.status, error.response?.data?.message || error.message);
    }
    console.log('');

    // Test bookings endpoint
    console.log('3. Testing bookings endpoint...');
    try {
      const bookingsResponse = await axios.get(`${BASE_URL}/analytics/dashboard/bookings?period=30`);
      console.log('✅ Bookings data:', bookingsResponse.data);
    } catch (error) {
      console.log('❌ Bookings endpoint error:', error.response?.status, error.response?.data?.message || error.message);
    }
    console.log('');

    // Test routes endpoint
    console.log('4. Testing routes endpoint...');
    try {
      const routesResponse = await axios.get(`${BASE_URL}/analytics/dashboard/routes?period=30`);
      console.log('✅ Routes data:', routesResponse.data);
    } catch (error) {
      console.log('❌ Routes endpoint error:', error.response?.status, error.response?.data?.message || error.message);
    }
    console.log('');

  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

testAnalyticsSimple(); 