# Flutterwave Payment Testing System

This document describes the comprehensive payment testing system implemented for mobile money payments using Flutterwave integration.

## Overview

The payment testing system allows developers and administrators to test mobile money payment scenarios without processing real transactions. This is particularly useful for development, testing, and demonstration purposes.

## Features

### 🧪 Test Scenarios
- **Successful Payment**: Simulates successful mobile money transactions
- **Insufficient Funds**: Tests insufficient balance scenarios
- **Network Error**: Simulates network connectivity issues
- **Pending Payment**: Tests payment processing delays
- **Invalid PIN**: Tests wrong PIN entry scenarios
- **Invalid Phone Number**: Tests invalid phone number formats

### 🎛️ Test Mode Toggle
- Enable/disable test mode globally
- Persists test mode setting across sessions
- Visual indicators for test mode status

### 📊 Test History
- Track all test payments with timestamps
- View transaction IDs and results
- Clear test history functionality
- Export test results

### 🔧 Admin Controls
- Manage test scenarios from admin panel
- Configure expected results and error messages
- Enable/disable individual test scenarios
- Run bulk tests across all scenarios

## Implementation Details

### File Structure

```
monorepo/
├── apps/
│   ├── user/
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   └── flutterwave.ts          # Flutterwave service
│   │   │   └── components/
│   │   │       ├── Checkout.tsx            # Updated checkout with testing
│   │   │       └── PaymentTesting.tsx      # Payment testing component
│   └── admin/
│       └── client/
│           └── src/
│               └── pages/
│                   └── payment-testing.tsx  # Admin testing page
```

### Core Components

#### 1. Flutterwave Service (`flutterwave.ts`)

```typescript
class FlutterwaveService {
  // Test mode management
  setTestMode(enabled: boolean): void
  getTestMode(): boolean
  
  // Payment simulation
  simulateMobileMoneyPayment(data: TestPaymentData): Promise<PaymentResponse>
  
  // Test utilities
  getTestPhoneNumbers(): object
  getTestPINs(): object
}
```

#### 2. Payment Testing Component (`PaymentTesting.tsx`)

Provides a user-friendly interface for testing different payment scenarios:

- **Test Scenario Selection**: Choose from predefined scenarios
- **Phone Number Input**: Use test numbers or custom numbers
- **PIN Input**: Test with different PIN combinations
- **Real-time Feedback**: Immediate response to test actions

#### 3. Admin Testing Page (`payment-testing.tsx`)

Comprehensive admin interface for managing payment testing:

- **Scenario Management**: Create, edit, and configure test scenarios
- **Test Execution**: Run individual or bulk tests
- **History Tracking**: View detailed test history
- **Statistics**: Track success/failure rates

## Usage Guide

### For Users (Customer App)

1. **Navigate to Checkout**: Go through the booking process
2. **Enable Testing**: Click "Show Testing" in the payment section
3. **Select Scenario**: Choose a test scenario from the available options
4. **Enter Details**: Use the pre-filled phone number and PIN
5. **Test Payment**: Click "Test Payment" to simulate the transaction
6. **View Results**: See the payment result and proceed accordingly

### For Administrators

1. **Access Admin Panel**: Navigate to the admin dashboard
2. **Payment Testing**: Click "Payment Testing" in the sidebar
3. **Manage Scenarios**: Configure test scenarios as needed
4. **Run Tests**: Execute individual or bulk tests
5. **Monitor Results**: View test history and statistics

## Test Scenarios

### 1. Successful Payment
- **Phone Number**: `260977123456`
- **PIN**: `1234`
- **Expected Result**: Success
- **Use Case**: Testing successful booking flow

### 2. Insufficient Funds
- **Phone Number**: `260977123450`
- **PIN**: `1234`
- **Expected Result**: Failed
- **Error Message**: "Insufficient funds. Please top up your mobile money account and try again."

### 3. Network Error
- **Phone Number**: `260977123451`
- **PIN**: `1234`
- **Expected Result**: Failed
- **Error Message**: "Network error. Please check your connection and try again."

### 4. Pending Payment
- **Phone Number**: `260977123452`
- **PIN**: `1234`
- **Expected Result**: Pending
- **Use Case**: Testing payment processing delays

### 5. Invalid PIN
- **Phone Number**: `260977123453`
- **PIN**: `9999`
- **Expected Result**: Failed
- **Error Message**: "Invalid PIN. Please enter a 4-digit PIN."

### 6. Invalid Phone Number
- **Phone Number**: `260977123`
- **PIN**: `1234`
- **Expected Result**: Failed
- **Error Message**: "Invalid phone number. Please enter a valid 10-digit phone number."

## Configuration

### Environment Variables

```bash
# Flutterwave Configuration (for production)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_xxxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_xxxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_BASE_URL=https://api.flutterwave.com/v3

# Test Mode (default: true)
FLUTTERWAVE_TEST_MODE=true
```

### Local Storage Keys

```javascript
// Test mode setting
localStorage.setItem('flutterwave_test_mode', 'true')

// Test history
localStorage.setItem('payment_test_history', JSON.stringify(testHistory))
```

## API Integration

### Payment Response Format

```typescript
interface PaymentResponse {
  status: 'success' | 'failed' | 'pending';
  message: string;
  transaction_id?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  payment_type?: string;
  customer?: {
    email: string;
    phone_number: string;
    name: string;
  };
}
```

### Test Data Format

```typescript
interface TestPaymentData {
  phoneNumber: string;
  pin: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  bookingReference: string;
}
```

## Security Considerations

1. **Test Mode Isolation**: Test mode completely isolates from real payment processing
2. **No Real Transactions**: All test scenarios are simulated without actual API calls
3. **Data Validation**: Input validation prevents invalid test data
4. **Session Management**: Test mode persists across sessions but can be toggled

## Development Workflow

### Adding New Test Scenarios

1. **Update Flutterwave Service**: Add new scenario logic in `simulateMobileMoneyPayment()`
2. **Update Test Component**: Add scenario to the test scenarios array
3. **Update Admin Panel**: Add scenario configuration in admin interface
4. **Test Integration**: Verify the new scenario works end-to-end

### Example: Adding a "Timeout" Scenario

```typescript
// In flutterwave.ts
if (phoneLastDigit === '4') {
  // Simulate timeout
  resolve({
    status: 'failed',
    message: 'Payment timeout. Please try again.',
    transaction_id: `TXN_${Date.now()}_TIMEOUT`,
    reference: data.bookingReference,
    amount: data.amount,
    currency: data.currency,
    payment_type: 'mobile_money'
  });
}
```

## Troubleshooting

### Common Issues

1. **Test Mode Not Working**
   - Check localStorage for `flutterwave_test_mode` setting
   - Verify the service is properly initialized

2. **Scenarios Not Loading**
   - Check browser console for JavaScript errors
   - Verify component imports are correct

3. **Payment Not Processing**
   - Ensure all required fields are filled
   - Check network connectivity
   - Verify test mode is enabled

### Debug Mode

Enable debug logging by adding to browser console:

```javascript
localStorage.setItem('flutterwave_debug', 'true')
```

## Future Enhancements

1. **Real Flutterwave Integration**: Add actual Flutterwave API integration
2. **Advanced Scenarios**: Add more complex payment scenarios
3. **Analytics Dashboard**: Enhanced reporting and analytics
4. **Automated Testing**: Integration with CI/CD pipelines
5. **Multi-Currency Support**: Support for different currencies
6. **Webhook Testing**: Test webhook notifications

## Support

For questions or issues with the payment testing system:

1. Check this documentation
2. Review browser console for errors
3. Verify test mode settings
4. Contact development team

---

**Note**: This testing system is designed for development and testing purposes only. For production use, ensure proper Flutterwave API integration and security measures are in place. 