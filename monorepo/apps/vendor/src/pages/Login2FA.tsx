import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { twoFactorAuth } from '../lib/auth2fa';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Bus,
  Loader2,
  Shield,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 30; // seconds

// Storage keys for remember me functionality
const REMEMBER_ME_KEY = 'vendor_remember_me';
const SAVED_EMAIL_KEY = 'vendor_saved_email';

export default function Login2FA() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockout, setLockout] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(LOCKOUT_TIME);
  const [authStep, setAuthStep] = useState<'login' | 'otp' | 'verified'>('login');
  const [otpEmail, setOtpEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  console.log("Login2FA component loaded");

  // Load saved credentials on component mount
  useEffect(() => {
    const savedRememberMe = localStorage.getItem(REMEMBER_ME_KEY);
    if (savedRememberMe === 'true') {
      const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  // Animate card entrance
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.classList.add('animate-fade-in-up');
    }
  }, []);

  // Lockout timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockout && lockoutTimer > 0) {
      timer = setTimeout(() => setLockoutTimer(lockoutTimer - 1), 1000);
    } else if (lockout && lockoutTimer === 0) {
      setLockout(false);
      setLockoutTimer(LOCKOUT_TIME);
      setFailedAttempts(0);
    }
    return () => clearTimeout(timer);
  }, [lockout, lockoutTimer]);

  // Resend timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading || lockout) return;
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const result = await twoFactorAuth.initiateLogin(email, password);
      
      if (result.success) {
        if (result.requires2FA) {
          // 2FA required - move to OTP step
          setAuthStep('otp');
          setOtpEmail(email);
          setSuccess(result.message);
          setResendTimer(60); // 60 second cooldown for resend
        } else {
          // No 2FA required - proceed to dashboard
          handleRememberMe();
          navigate('/dashboard');
        }
      } else {
        setError(result.message);
        setFailedAttempts((a) => a + 1);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      setFailedAttempts((a) => a + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await twoFactorAuth.sendOTPEmail(otpEmail);
      if (result.success) {
        setSuccess('Verification email sent again');
        setResendTimer(60);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setAuthStep('login');
    setError('');
    setSuccess('');
    twoFactorAuth.resetAuthState();
  };

  const handleRememberMe = () => {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      localStorage.setItem(SAVED_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem(SAVED_EMAIL_KEY);
    }
  };

  useEffect(() => {
    if (failedAttempts >= MAX_ATTEMPTS) {
      setLockout(true);
    }
  }, [failedAttempts]);

  const handleForgotPassword = () => {
    alert('Forgot password functionality will be implemented soon.');
  };

  // Prevent copy/paste on password field
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  // Handle "Remember Me" checkbox change
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    if (!checked) {
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem(SAVED_EMAIL_KEY);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (authStep === 'otp') {
    console.log("Rendering OTP step", { authStep, otpEmail });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-400 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-400 opacity-30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400 opacity-30 rounded-full blur-3xl animate-pulse-slow" />
        
        <div ref={cardRef} className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl shadow-xl p-8 max-w-md w-full z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Two-Factor Authentication</h1>
            <p className="text-white/80 text-sm">Check your email for verification</p>
          </div>

          {/* OTP Instructions */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/90 mb-4">
                We've sent a verification link to:
              </p>
              <p className="text-white font-semibold text-lg mb-6">
                {otpEmail}
              </p>
              <p className="text-white/80 text-sm">
                Click the link in your email to complete the verification process.
              </p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <Alert className="bg-green-500/20 border-green-500/30">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="bg-red-500/20 border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Resend Button */}
            <div className="text-center">
              <p className="text-white/60 text-sm mb-2">
                Didn't receive the email?
              </p>
              <Button
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || isLoading}
                className="bg-white/20 text-white border border-white/30 hover:bg-white/30 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend in ${formatTime(resendTimer)}`
                ) : (
                  'Resend Email'
                )}
              </Button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Button
                onClick={handleBackToLogin}
                variant="ghost"
                className="text-white/80 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-white/60">
              © 2024 Tiyende. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log("Rendering login form", { authStep });
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-400 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-400 opacity-30 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400 opacity-30 rounded-full blur-3xl animate-pulse-slow" />
      <div ref={cardRef} className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl shadow-xl p-8 max-w-md w-full z-10">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Bus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Tiyende</h1>
          <p className="text-white/80 text-sm">Vendor Portal</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">2FA Protected</span>
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="on">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || lockout}
                aria-label="Email address"
              />
            </div>
          </div>
          
          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || lockout}
                aria-label="Password"
                onPaste={handlePaste}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                disabled={isLoading || lockout}
                tabIndex={0}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={handleRememberMeChange}
                disabled={isLoading || lockout}
                className="border-white/30 data-[state=checked]:bg-indigo-500"
                aria-label="Remember me"
              />
              <label htmlFor="remember" className="text-sm text-white/80 cursor-pointer">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-white/80 hover:text-white transition-colors"
              disabled={isLoading || lockout}
              tabIndex={0}
            >
              Forgot password?
            </button>
          </div>
          
          {/* Error Message & Lockout */}
          {error && !lockout && (
            <Alert className="bg-red-500/20 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {lockout && (
            <Alert className="bg-yellow-500/20 border-yellow-500/30">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                Too many failed attempts. Please try again in {lockoutTimer} seconds.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || lockout}
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold py-3 rounded-lg hover:from-indigo-600 hover:to-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-disabled={isLoading || lockout}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/60">
            © 2024 Tiyende. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Animation keyframes */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(32px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s cubic-bezier(.4,0,.2,1) forwards;
        }
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