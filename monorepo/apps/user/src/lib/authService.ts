import { 
  signInWithProvider, 
  signInWithProviderRedirect, 
  getRedirectResultAuth, 
  signOutUser, 
  getCurrentUser, 
  getUserToken,
  googleProvider,
  facebookProvider,
  twitterProvider,
  githubProvider
} from './firebase';
import { auth as apiAuth } from './api';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  providerId: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  token?: string;
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const result = await signInWithProvider(googleProvider);
      
      if (result.success && result.user) {
        const authUser = this.mapFirebaseUserToAuthUser(result.user, 'google.com');
        const token = await this.verifyWithBackend(result.user);
        
        return {
          success: true,
          user: authUser,
          token: token || undefined,
          error: undefined
        };
      } else {
        return {
          success: false,
          error: result.error || 'Google sign-in failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Google sign-in failed'
      };
    }
  }

  // Sign in with Facebook
  async signInWithFacebook(): Promise<AuthResult> {
    try {
      const result = await signInWithProvider(facebookProvider);
      
      if (result.success && result.user) {
        const authUser = this.mapFirebaseUserToAuthUser(result.user, 'facebook.com');
        const token = await this.verifyWithBackend(result.user);
        
        return {
          success: true,
          user: authUser,
          token: token || undefined,
          error: undefined
        };
      } else {
        return {
          success: false,
          error: result.error || 'Facebook sign-in failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Facebook sign-in failed'
      };
    }
  }

  // Sign in with Twitter
  async signInWithTwitter(): Promise<AuthResult> {
    try {
      const result = await signInWithProvider(twitterProvider);
      
      if (result.success && result.user) {
        const authUser = this.mapFirebaseUserToAuthUser(result.user, 'twitter.com');
        const token = await this.verifyWithBackend(result.user);
        
        return {
          success: true,
          user: authUser,
          token: token || undefined,
          error: undefined
        };
      } else {
        return {
          success: false,
          error: result.error || 'Twitter sign-in failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Twitter sign-in failed'
      };
    }
  }

  // Sign in with GitHub
  async signInWithGithub(): Promise<AuthResult> {
    try {
      const result = await signInWithProvider(githubProvider);
      
      if (result.success && result.user) {
        const authUser = this.mapFirebaseUserToAuthUser(result.user, 'github.com');
        const token = await this.verifyWithBackend(result.user);
        
        return {
          success: true,
          user: authUser,
          token: token || undefined,
          error: undefined
        };
      } else {
        return {
          success: false,
          error: result.error || 'GitHub sign-in failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'GitHub sign-in failed'
      };
    }
  }

  // Sign in with redirect (for mobile)
  async signInWithRedirect(provider: 'google' | 'facebook' | 'twitter' | 'github'): Promise<AuthResult> {
    try {
      let selectedProvider;
      switch (provider) {
        case 'google':
          selectedProvider = googleProvider;
          break;
        case 'facebook':
          selectedProvider = facebookProvider;
          break;
        case 'twitter':
          selectedProvider = twitterProvider;
          break;
        case 'github':
          selectedProvider = githubProvider;
          break;
        default:
          throw new Error('Invalid provider');
      }

      const result = await signInWithProviderRedirect(selectedProvider);
      
      if (result.success) {
        return {
          success: true,
          error: undefined
        };
      } else {
        return {
          success: false,
          error: result.error || `${provider} sign-in failed`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `${provider} sign-in failed`
      };
    }
  }

  // Handle redirect result
  async handleRedirectResult(): Promise<AuthResult> {
    try {
      const result = await getRedirectResultAuth();
      
      if (result.success && result.user) {
        const authUser = this.mapFirebaseUserToAuthUser(result.user, result.user.providerData[0]?.providerId || 'unknown');
        const token = await this.verifyWithBackend(result.user);
        
        return {
          success: true,
          user: authUser,
          token: token || undefined,
          error: undefined
        };
      } else {
        return {
          success: false,
          error: result.error || 'Redirect sign-in failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Redirect sign-in failed'
      };
    }
  }

  // Sign out
  async signOut(): Promise<AuthResult> {
    try {
      const result = await signOutUser();
      
      if (result.success) {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        return {
          success: true,
          error: undefined
        };
      } else {
        return {
          success: false,
          error: result.error || 'Sign out failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sign out failed'
      };
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    const firebaseUser = getCurrentUser();
    if (firebaseUser) {
      return this.mapFirebaseUserToAuthUser(firebaseUser, firebaseUser.providerData[0]?.providerId || 'unknown');
    }
    return null;
  }

  // Verify with backend
  private async verifyWithBackend(firebaseUser: any): Promise<string | null> {
    try {
      const idToken = await firebaseUser.getIdToken();
      
      // Call your backend to verify the Firebase token
      const response = await fetch('http://localhost:4000/api/user/verify-firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseToken: idToken,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
          providerId: firebaseUser.providerData[0]?.providerId || 'unknown'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        // Store the backend token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.token;
      } else {
        console.error('Backend verification failed:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error verifying with backend:', error);
      return null;
    }
  }

  // Map Firebase user to AuthUser
  private mapFirebaseUserToAuthUser(firebaseUser: any, providerId: string): AuthUser {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      phoneNumber: firebaseUser.phoneNumber,
      providerId: providerId
    };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = getCurrentUser();
    return !!(token && user);
  }

  // Get stored user data
  getStoredUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
      }
    }
    return null;
  }
}

export const authService = AuthService.getInstance(); 