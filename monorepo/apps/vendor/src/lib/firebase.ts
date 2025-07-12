import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  updateProfile,
  User,
  Auth,
  UserCredential
} from 'firebase/auth';

// Firebase configuration for Tiyende Vendor Portal
const firebaseConfig = {
  apiKey: "AIzaSyBPk_syKD4NFCsrUM4oAT9CLcC_Ihckejo",
  authDomain: "tiyende-3811a.firebaseapp.com",
  projectId: "tiyende-3811a",
  storageBucket: "tiyende-3811a.firebasestorage.app",
  messagingSenderId: "445104975683",
  appId: "1:445104975683:web:ac8c6df9c3e8f94c8b49f6",
  measurementId: "G-M8B7ZQ1KJ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure email link settings
const actionCodeSettings = {
  url: 'http://localhost:4001/verify-email', // Updated for port 4001
  handleCodeInApp: true,
  iOS: {
    bundleId: 'com.tiyende.ios'
  },
  android: {
    packageName: 'com.tiyende.android',
    installApp: true,
    minimumVersion: '12'
  }
  // Removed dynamicLinkDomain as it's not needed for basic email verification
};

export {
  auth,
  actionCodeSettings,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  updateProfile
};

export type { User, Auth, UserCredential }; 