import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { twoFactorAuth } from '../lib/auth2fa';
import { Shield, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    handleEmailVerification();
    // eslint-disable-next-line
  }, []);

  const handleEmailVerification = async () => {
    try {
      // Try to get the email from localStorage first
      let savedEmail = localStorage.getItem('vendor_2fa_email');
      // If not found, try to get it from the URL
      if (!savedEmail) {
        const params = new URLSearchParams(location.search);
        savedEmail = params.get('email') || '';
      }
      if (!savedEmail) {
        setVerificationStatus('error');
        setMessage('No email found for verification. Please try logging in again.');
        setIsVerifying(false);
        return;
      }
      setEmail(savedEmail);
      // Check if this is a Firebase email link
      const isEmailLink = window.location.href.includes('apiKey=') || 
                         window.location.href.includes('continueUrl=') ||
                         window.location.href.includes('oobCode=');
      if (!isEmailLink) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        setIsVerifying(false);
        return;
      }
      // Verify the email link
      const result = await twoFactorAuth.verifyOTP(savedEmail);
      if (result.success) {
        setVerificationStatus('success');
        setMessage('Email verification successful! Redirecting to dashboard...');
        // Clear the stored email
        localStorage.removeItem('vendor_2fa_email');
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setVerificationStatus('error');
        setMessage(result.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    setIsVerifying(true);
    setVerificationStatus('pending');
    setMessage('');
    handleEmailVerification();
  };

  const handleBackToLogin = () => {
    localStorage.removeItem('vendor_2fa_email');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-400 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-400 opacity-30 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400 opacity-30 rounded-full blur-3xl animate-pulse-slow" />
      
      <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl shadow-xl p-8 max-w-md w-full z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Email Verification</h1>
          <p className="text-white/80 text-sm">
            {email && `Verifying email: ${email}`}
          </p>
        </div>

        {/* Verification Status */}
        <div className="space-y-6">
          {isVerifying ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-white/90">Verifying your email...</p>
            </div>
          ) : (
            <>
              {/* Success State */}
              {verificationStatus === 'success' && (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </div>
                  <Alert className="bg-green-500/20 border-green-500/30">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-200">
                      {message}
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {verificationStatus === 'error' && (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <AlertCircle className="w-12 h-12 text-red-400" />
                  </div>
                  <Alert className="bg-red-500/20 border-red-500/30">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-200">
                      {message}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleRetry}
                      className="w-full bg-white/20 text-white border border-white/30 hover:bg-white/30"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={handleBackToLogin}
                      variant="ghost"
                      className="w-full text-white/80 hover:text-white"
                    >
                      Back to Login
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/60">
            © 2024 Tiyende. All rights reserved.
          </p>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 