// Flutterwave Payment Service for Testing
export interface FlutterwaveConfig {
  publicKey: string;
  txRef: string;
  amount: number;
  currency: string;
  country: string;
  customer: {
    email: string;
    phone_number: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  payment_options: string;
  redirect_url?: string;
  meta?: any;
}

export interface PaymentResponse {
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

export interface TestPaymentData {
  phoneNumber: string;
  pin: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  bookingReference: string;
}

class FlutterwaveService {
  private isTestMode: boolean = true; // Default to test mode
  private testConfig = {
    publicKey: 'FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxx',
    secretKey: 'FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxx',
    baseUrl: 'https://api.flutterwave.com/v3',
    testBaseUrl: 'https://sandbox-api.flutterwave.com/v3'
  };

  constructor() {
    // Check if we're in test mode from environment or localStorage
    const testMode = localStorage.getItem('flutterwave_test_mode');
    if (testMode !== null) {
      this.isTestMode = testMode === 'true';
    }
  }

  // Toggle test mode
  setTestMode(enabled: boolean) {
    this.isTestMode = enabled;
    localStorage.setItem('flutterwave_test_mode', enabled.toString());
  }

  // Get current test mode status
  getTestMode(): boolean {
    return this.isTestMode;
  }

  // Simulate mobile money payment for testing
  async simulateMobileMoneyPayment(data: TestPaymentData): Promise<PaymentResponse> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Validate test data
        if (!data.phoneNumber || data.phoneNumber.length < 10) {
          resolve({
            status: 'failed',
            message: 'Invalid phone number. Please enter a valid 10-digit phone number.'
          });
          return;
        }

        if (!data.pin || data.pin.length !== 4) {
          resolve({
            status: 'failed',
            message: 'Invalid PIN. Please enter a 4-digit PIN.'
          });
          return;
        }

        if (data.amount <= 0) {
          resolve({
            status: 'failed',
            message: 'Invalid amount. Amount must be greater than 0.'
          });
          return;
        }

        // Simulate different test scenarios based on phone number patterns
        const phoneLastDigit = data.phoneNumber.slice(-1);
        
        // Test scenarios for different phone numbers
        if (phoneLastDigit === '0') {
          // Simulate insufficient funds
          resolve({
            status: 'failed',
            message: 'Insufficient funds. Please top up your mobile money account and try again.',
            transaction_id: `TXN_${Date.now()}_FAILED`,
            reference: data.bookingReference,
            amount: data.amount,
            currency: data.currency,
            payment_type: 'mobile_money'
          });
        } else if (phoneLastDigit === '1') {
          // Simulate network error
          resolve({
            status: 'failed',
            message: 'Network error. Please check your connection and try again.',
            transaction_id: `TXN_${Date.now()}_NETWORK_ERROR`,
            reference: data.bookingReference,
            amount: data.amount,
            currency: data.currency,
            payment_type: 'mobile_money'
          });
        } else if (phoneLastDigit === '2') {
          // Simulate pending payment
          resolve({
            status: 'pending',
            message: 'Payment is being processed. Please wait for confirmation.',
            transaction_id: `TXN_${Date.now()}_PENDING`,
            reference: data.bookingReference,
            amount: data.amount,
            currency: data.currency,
            payment_type: 'mobile_money',
            customer: {
              email: data.customerEmail,
              phone_number: data.phoneNumber,
              name: data.customerName
            }
          });
        } else {
          // Simulate successful payment (default for other numbers)
          resolve({
            status: 'success',
            message: 'Payment successful! Your booking has been confirmed.',
            transaction_id: `TXN_${Date.now()}_SUCCESS`,
            reference: data.bookingReference,
            amount: data.amount,
            currency: data.currency,
            payment_type: 'mobile_money',
            customer: {
              email: data.customerEmail,
              phone_number: data.phoneNumber,
              name: data.customerName
            }
          });
        }
      }, 2000); // 2 second delay to simulate processing
    });
  }

  // Initialize Flutterwave payment (for real implementation)
  async initializePayment(config: FlutterwaveConfig): Promise<any> {
    if (this.isTestMode) {
      // In test mode, return a mock response
      return {
        status: 'success',
        data: {
          link: '#',
          reference: config.txRef,
          status: 'pending'
        }
      };
    }

    // Real Flutterwave API call would go here
    try {
      const response = await fetch(`${this.testConfig.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.testConfig.publicKey}`
        },
        body: JSON.stringify(config)
      });

      return await response.json();
    } catch (error) {
      throw new Error('Failed to initialize payment');
    }
  }

  // Verify payment (for real implementation)
  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    if (this.isTestMode) {
      // In test mode, return a mock verification
      return {
        status: 'success',
        message: 'Payment verified successfully',
        transaction_id: transactionId,
        reference: `REF_${Date.now()}`,
        amount: 0,
        currency: 'ZMW',
        payment_type: 'mobile_money'
      };
    }

    // Real Flutterwave verification would go here
    try {
      const response = await fetch(`${this.testConfig.baseUrl}/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.testConfig.secretKey}`
        }
      });

      const data = await response.json();
      return {
        status: data.status === 'successful' ? 'success' : 'failed',
        message: data.message || 'Payment verification completed',
        transaction_id: data.data?.id,
        reference: data.data?.reference,
        amount: data.data?.amount,
        currency: data.data?.currency,
        payment_type: data.data?.payment_type
      };
    } catch (error) {
      throw new Error('Failed to verify payment');
    }
  }

  // Get test phone numbers for different scenarios
  getTestPhoneNumbers() {
    return {
      success: '260977123456', // Ends with 6 - success
      insufficientFunds: '260977123450', // Ends with 0 - insufficient funds
      networkError: '260977123451', // Ends with 1 - network error
      pending: '260977123452', // Ends with 2 - pending
      invalidPin: '260977123453', // Ends with 3 - invalid PIN
      invalidPhone: '260977123', // Too short - invalid phone
    };
  }

  // Get test PINs
  getTestPINs() {
    return {
      valid: '1234',
      invalid: '0000',
      wrong: '9999'
    };
  }
}

export const flutterwaveService = new FlutterwaveService();
export default flutterwaveService; 