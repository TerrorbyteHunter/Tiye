import { auth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, actionCodeSettings } from './firebase';
import { auth as apiAuth } from './api';

export interface TwoFactorAuthState {
  isEnabled: boolean;
  isVerified: boolean;
  email: string;
  step: 'login' | 'otp' | 'verified';
}

export class TwoFactorAuthService {
  private static instance: TwoFactorAuthService;
  private authState: TwoFactorAuthState = {
    isEnabled: false,
    isVerified: false,
    email: '',
    step: 'login'
  };

  private constructor() {}

  static getInstance(): TwoFactorAuthService {
    if (!TwoFactorAuthService.instance) {
      TwoFactorAuthService.instance = new TwoFactorAuthService();
    }
    return TwoFactorAuthService.instance;
  }

  // Step 1: Initial login with email/password
  async initiateLogin(email: string, password: string): Promise<{ success: boolean; message: string; requires2FA?: boolean }> {
    try {
      // First, authenticate with your backend
      const response = await apiAuth.login({ email, password });
      
      if (response && response.token) {
        // Check if 2FA is enabled for this vendor
        const is2FAEnabled = await this.check2FAStatus(email);
        
        if (is2FAEnabled) {
          // Store email for 2FA process
          this.authState.email = email;
          this.authState.step = 'otp';
          
          // Send OTP email
          await this.sendOTPEmail(email);
          
          return {
            success: true,
            message: 'Please check your email for the verification code',
            requires2FA: true
          };
        } else {
          // 2FA not enabled, proceed with normal login
          this.authState.step = 'verified';
          this.authState.isVerified = true;
          return {
            success: true,
            message: 'Login successful'
          };
        }
      }
      
      return {
        success: false,
        message: 'Invalid credentials'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  // Step 2: Send OTP email
  async sendOTPEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Save email to localStorage for verification
      localStorage.setItem('vendor_2fa_email', email);
      
      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return {
        success: false,
        message: 'Failed to send verification email. Please try again.'
      };
    }
  }

  // Step 3: Verify OTP
  async verifyOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        // Get the email from localStorage
        const savedEmail = localStorage.getItem('vendor_2fa_email');
        if (!savedEmail || savedEmail !== email) {
          return {
            success: false,
            message: 'Email mismatch. Please use the same email address.'
          };
        }

        // Sign in with email link
        const result = await signInWithEmailLink(auth, email, window.location.href);
        
        if (result.user) {
          // Get the Firebase ID token
          const firebaseToken = await result.user.getIdToken();
          
          // Verify with your backend
          const backendVerification = await this.verifyWithBackend(firebaseToken, email);
          
          if (backendVerification.success) {
            this.authState.isVerified = true;
            this.authState.step = 'verified';
            
            // Clear stored email
            localStorage.removeItem('vendor_2fa_email');
            
            return {
              success: true,
              message: 'Two-factor authentication successful'
            };
          } else {
            return backendVerification;
          }
        }
      }
      
      return {
        success: false,
        message: 'Invalid verification link'
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    }
  }

  // Check if 2FA is enabled for a vendor
  private async check2FAStatus(email: string): Promise<boolean> {
    try {
      // This would typically check your database
      // For now, we'll enable 2FA for all vendors
      return true;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  }

  // Verify with backend after Firebase authentication
  private async verifyWithBackend(firebaseToken: string, email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Call your backend to verify the Firebase token
      const response = await fetch('/api/vendor/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseToken,
          email
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store the backend token
        localStorage.setItem('vendor_token', data.token);
        return {
          success: true,
          message: 'Verification successful'
        };
      } else {
        return {
          success: false,
          message: data.error || 'Backend verification failed'
        };
      }
    } catch (error) {
      console.error('Backend verification error:', error);
      return {
        success: false,
        message: 'Backend verification failed'
      };
    }
  }

  // Enable 2FA for a vendor
  async enable2FA(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // This would typically update your database
      // For now, we'll just return success
      return {
        success: true,
        message: 'Two-factor authentication enabled'
      };
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return {
        success: false,
        message: 'Failed to enable two-factor authentication'
      };
    }
  }

  // Disable 2FA for a vendor
  async disable2FA(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // This would typically update your database
      // For now, we'll just return success
      return {
        success: true,
        message: 'Two-factor authentication disabled'
      };
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return {
        success: false,
        message: 'Failed to disable two-factor authentication'
      };
    }
  }

  // Get current auth state
  getAuthState(): TwoFactorAuthState {
    return { ...this.authState };
  }

  // Reset auth state
  resetAuthState(): void {
    this.authState = {
      isEnabled: false,
      isVerified: false,
      email: '',
      step: 'login'
    };
  }

  // Check if user is currently in 2FA flow
  isIn2FAFlow(): boolean {
    return this.authState.step === 'otp';
  }

  // Check if user is verified
  isVerified(): boolean {
    return this.authState.isVerified;
  }
}

export const twoFactorAuth = TwoFactorAuthService.getInstance(); 