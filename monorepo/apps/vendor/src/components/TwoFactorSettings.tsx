import * as React from 'react';
import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldX, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface TwoFactorSettingsProps {
  vendorEmail: string;
}

export default function TwoFactorSettings({ vendorEmail }: TwoFactorSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      const response = await fetch('/api/vendor/2fa-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vendor_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsEnabled(data.twoFactorEnabled);
      } else {
        console.error('Failed to check 2FA status');
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/vendor/enable-2fa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vendor_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsEnabled(true);
        setSuccess('Two-factor authentication has been enabled successfully.');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to enable two-factor authentication');
      }
    } catch (error) {
      setError('An error occurred while enabling two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/vendor/disable-2fa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vendor_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsEnabled(false);
        setSuccess('Two-factor authentication has been disabled successfully.');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to disable two-factor authentication');
      }
    } catch (error) {
      setError('An error occurred while disabling two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Checking 2FA status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Enhance your account security with two-factor authentication using email verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <>
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-700">Enabled</span>
              </>
            ) : (
              <>
                <ShieldX className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Disabled</span>
              </>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {isEnabled ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Email Display */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">Email:</span> {vendorEmail}
        </div>

        {/* Error Message */}
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <Button
          onClick={isEnabled ? handleDisable2FA : handleEnable2FA}
          disabled={isLoading}
          variant={isEnabled ? "destructive" : "default"}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEnabled ? 'Disabling...' : 'Enabling...'}
            </>
          ) : (
            <>
              {isEnabled ? (
                <>
                  <ShieldX className="w-4 h-4 mr-2" />
                  Disable 2FA
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Enable 2FA
                </>
              )}
            </>
          )}
        </Button>

        {/* Information */}
        <div className="text-xs text-gray-500 space-y-2">
          <p>
            <strong>How it works:</strong> When enabled, you'll receive a verification email each time you log in.
          </p>
          <p>
            <strong>Security:</strong> This adds an extra layer of protection to your account.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 