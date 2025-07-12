import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Ghost } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-400">
      <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-md w-full">
        <Ghost className="w-16 h-16 text-indigo-400 mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow">404</h1>
        <p className="text-lg text-white/80 mb-6 text-center">Oops! The page you're looking for doesn't exist.<br />Let's get you back on track.</p>
        <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold px-6 py-2 rounded-full shadow hover:scale-105 transition-transform">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
} 