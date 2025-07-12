import React, { useState } from 'react';
import flutterwaveService, { TestPaymentData, PaymentResponse } from '../lib/flutterwave';

interface PaymentTestingProps {
  onPaymentComplete: (response: PaymentResponse) => void;
  amount: number;
  customerName: string;
  customerEmail: string;
  bookingReference: string;
}

export function PaymentTesting({ 
  onPaymentComplete, 
  amount, 
  customerName, 
  customerEmail, 
  bookingReference 
}: PaymentTestingProps) {
  const [selectedScenario, setSelectedScenario] = useState('success');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [testMode, setTestMode] = useState(flutterwaveService.getTestMode());

  const testScenarios = [
    {
      id: 'success',
      name: 'Successful Payment',
      description: 'Simulates a successful mobile money payment',
      phoneNumber: '260977123456',
      pin: '1234',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'insufficientFunds',
      name: 'Insufficient Funds',
      description: 'Simulates insufficient balance in mobile money account',
      phoneNumber: '260977123450',
      pin: '1234',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'networkError',
      name: 'Network Error',
      description: 'Simulates network connectivity issues',
      phoneNumber: '260977123451',
      pin: '1234',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'pending',
      name: 'Pending Payment',
      description: 'Simulates a payment that is being processed',
      phoneNumber: '260977123452',
      pin: '1234',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'invalidPin',
      name: 'Invalid PIN',
      description: 'Simulates wrong PIN entry',
      phoneNumber: '260977123453',
      pin: '9999',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'invalidPhone',
      name: 'Invalid Phone Number',
      description: 'Simulates invalid phone number format',
      phoneNumber: '260977123',
      pin: '1234',
      color: 'bg-red-100 text-red-800'
    }
  ];

  const handleScenarioSelect = (scenario: typeof testScenarios[0]) => {
    setSelectedScenario(scenario.id);
    setPhoneNumber(scenario.phoneNumber);
    setPin(scenario.pin);
  };

  const handleTestModeToggle = () => {
    const newMode = !testMode;
    setTestMode(newMode);
    flutterwaveService.setTestMode(newMode);
  };

  const handlePaymentTest = async () => {
    setIsProcessing(true);
    
    try {
      const paymentData: TestPaymentData = {
        phoneNumber,
        pin,
        amount,
        currency: 'ZMW',
        customerName,
        customerEmail,
        bookingReference
      };

      const response = await flutterwaveService.simulateMobileMoneyPayment(paymentData);
      onPaymentComplete(response);
    } catch (error) {
      console.error('Payment test error:', error);
      onPaymentComplete({
        status: 'failed',
        message: 'An unexpected error occurred during payment testing.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedScenarioData = testScenarios.find(s => s.id === selectedScenario);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Payment Testing</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Test Mode:</span>
          <button
            onClick={handleTestModeToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              testMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                testMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {testMode ? (
        <div className="space-y-6">
          {/* Test Scenarios */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Test Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedScenario === scenario.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${scenario.color}`}
                >
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-sm opacity-75">{scenario.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="260977123456"
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use the test numbers above or enter your own
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                maxLength={4}
                minLength={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use 1234 for most scenarios, 9999 for invalid PIN test
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Test Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">K {amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Ref:</span>
                  <span className="font-medium">{bookingReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scenario:</span>
                  <span className="font-medium">{selectedScenarioData?.name}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePaymentTest}
              disabled={isProcessing || !phoneNumber || !pin}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Testing Payment...' : 'Test Payment'}
            </button>
          </div>

          {/* Test Mode Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Test Mode Active</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>You are currently in test mode. No real payments will be processed.</p>
                  <p className="mt-1">Use the test scenarios above to simulate different payment outcomes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Test Mode Disabled</h3>
          <p className="text-gray-600 mb-4">
            Enable test mode to access payment testing features.
          </p>
          <button
            onClick={handleTestModeToggle}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Enable Test Mode
          </button>
        </div>
      )}
    </div>
  );
} 