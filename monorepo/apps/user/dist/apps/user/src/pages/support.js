import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const Support = () => {
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle');
    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('success');
        setMessage('');
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto py-8 px-4", children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Support" }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Contact Us" }), _jsxs("p", { className: "mb-2", children: ["For urgent issues, call us at ", _jsx("span", { className: "font-mono", children: "+260 123 456 789" }), " or email ", _jsx("a", { href: "mailto:support@tiyende.com", className: "text-blue-600 hover:underline", children: "support@tiyende.com" }), "."] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Frequently Asked Questions" }), _jsxs("ul", { className: "list-disc list-inside space-y-2 text-gray-700", children: [_jsxs("li", { children: ["How do I change my booking? ", _jsx("span", { className: "text-gray-500", children: "Contact support with your booking reference." })] }), _jsxs("li", { children: ["How do I reset my password? ", _jsx("span", { className: "text-gray-500", children: "Use the profile page to change your password." })] }), _jsxs("li", { children: ["How do I get a refund? ", _jsx("span", { className: "text-gray-500", children: "Contact support with your ticket details." })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Submit a Request" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("textarea", { className: "border rounded px-3 py-2 w-full", rows: 4, placeholder: "Describe your issue or question...", value: message, onChange: e => setMessage(e.target.value), required: true }), _jsx("button", { type: "submit", className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700", children: "Send" }), status === 'success' && _jsx("div", { className: "text-green-600 mt-2", children: "Your request has been submitted!" })] })] })] }));
};
export default Support;
