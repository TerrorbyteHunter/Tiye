import React, { useState } from 'react';

const Support: React.FC = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('success');
    setMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Support</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-2">For urgent issues, call us at <span className="font-mono">+260 123 456 789</span> or email <a href="mailto:support@tiyende.com" className="text-blue-600 hover:underline">support@tiyende.com</a>.</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>How do I change my booking? <span className="text-gray-500">Contact support with your booking reference.</span></li>
          <li>How do I reset my password? <span className="text-gray-500">Use the profile page to change your password.</span></li>
          <li>How do I get a refund? <span className="text-gray-500">Contact support with your ticket details.</span></li>
        </ul>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Submit a Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="border rounded px-3 py-2 w-full"
            rows={4}
            placeholder="Describe your issue or question..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send</button>
          {status === 'success' && <div className="text-green-600 mt-2">Your request has been submitted!</div>}
        </form>
      </div>
    </div>
  );
};

export default Support; 