import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import flutterwaveService from '../lib/flutterwave';
export function PaymentTesting({ onPaymentComplete, amount, customerName, customerEmail, bookingReference }) {
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
    const handleScenarioSelect = (scenario) => {
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
            const paymentData = {
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
        }
        catch (error) {
            console.error('Payment test error:', error);
            onPaymentComplete({
                status: 'failed',
                message: 'An unexpected error occurred during payment testing.'
            });
        }
        finally {
            setIsProcessing(false);
        }
    };
    const selectedScenarioData = testScenarios.find(s => s.id === selectedScenario);
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Payment Testing" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Test Mode:" }), _jsx("button", { onClick: handleTestModeToggle, className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${testMode ? 'bg-blue-600' : 'bg-gray-200'}`, children: _jsx("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${testMode ? 'translate-x-6' : 'translate-x-1'}` }) })] })] }), testMode ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Test Scenarios" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: testScenarios.map((scenario) => (_jsxs("button", { onClick: () => handleScenarioSelect(scenario), className: `p-4 rounded-lg border-2 transition-all ${selectedScenario === scenario.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'} ${scenario.color}`, children: [_jsx("div", { className: "font-medium", children: scenario.name }), _jsx("div", { className: "text-sm opacity-75", children: scenario.description })] }, scenario.id))) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Phone Number" }), _jsx("input", { type: "tel", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), placeholder: "260977123456", className: "block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500", required: true }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Use the test numbers above or enter your own" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "PIN" }), _jsx("input", { type: "password", value: pin, onChange: (e) => setPin(e.target.value), placeholder: "1234", className: "block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500", required: true, maxLength: 4, minLength: 4 }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Use 1234 for most scenarios, 9999 for invalid PIN test" })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Test Details" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Amount:" }), _jsxs("span", { className: "font-medium", children: ["K ", amount.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Customer:" }), _jsx("span", { className: "font-medium", children: customerName })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Booking Ref:" }), _jsx("span", { className: "font-medium", children: bookingReference })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Scenario:" }), _jsx("span", { className: "font-medium", children: selectedScenarioData?.name })] })] })] }), _jsx("button", { onClick: handlePaymentTest, disabled: isProcessing || !phoneNumber || !pin, className: "w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: isProcessing ? 'Testing Payment...' : 'Test Payment' })] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-blue-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-blue-800", children: "Test Mode Active" }), _jsxs("div", { className: "mt-2 text-sm text-blue-700", children: [_jsx("p", { children: "You are currently in test mode. No real payments will be processed." }), _jsx("p", { className: "mt-1", children: "Use the test scenarios above to simulate different payment outcomes." })] })] })] }) })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-gray-500 mb-4", children: _jsx("svg", { className: "mx-auto h-12 w-12", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }) }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Test Mode Disabled" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Enable test mode to access payment testing features." }), _jsx("button", { onClick: handleTestModeToggle, className: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors", children: "Enable Test Mode" })] }))] }));
}
