import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, GithubAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
// Firebase configuration for Tiyende User App
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
// Initialize Auth
export const auth = getAuth(app);
// Initialize Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const twitterProvider = new TwitterAuthProvider();
export const githubProvider = new GithubAuthProvider();
// Configure providers
googleProvider.setCustomParameters({
    prompt: 'select_account'
});
facebookProvider.setCustomParameters({
    display: 'popup'
});
// Configure auth settings to reduce warnings
auth.useDeviceLanguage();
auth.settings.appVerificationDisabledForTesting = true; // Only for development
// Export auth instance
export { app };
// Auth state listener
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};
// Sign in with popup
export const signInWithProvider = async (provider) => {
    try {
        const result = await signInWithPopup(auth, provider);
        return { success: true, user: result.user, error: null };
    }
    catch (error) {
        return { success: false, user: null, error: error.message };
    }
};
// Sign in with redirect
export const signInWithProviderRedirect = async (provider) => {
    try {
        await signInWithRedirect(auth, provider);
        return { success: true, error: null };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Get redirect result
export const getRedirectResultAuth = async () => {
    try {
        const result = await getRedirectResult(auth);
        return { success: true, user: result?.user || null, error: null };
    }
    catch (error) {
        return { success: false, user: null, error: error.message };
    }
};
// Sign out
export const signOutUser = async () => {
    try {
        await signOut(auth);
        return { success: true, error: null };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Get current user
export const getCurrentUser = () => {
    return auth.currentUser;
};
// Get user token
export const getUserToken = async () => {
    try {
        const user = auth.currentUser;
        if (user) {
            return await user.getIdToken();
        }
        return null;
    }
    catch (error) {
        console.error('Error getting user token:', error);
        return null;
    }
};
