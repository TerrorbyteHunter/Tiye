import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/api';
import { signInWithProvider, googleProvider, getUserToken } from '../lib/firebase';
import { FcGoogle } from 'react-icons/fc';
import { FaUser, FaPhone, FaLock } from 'react-icons/fa';
const SignupPage = () => {
    const [username, setUsername] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        if (!username.trim() || !mobile.trim() || !password.trim()) {
            setError('All fields are required.');
            return;
        }
        setLoading(true);
        try {
            const response = await auth.signup({ username: username.trim(), mobile: mobile.trim(), password });
            if (response.token) {
                localStorage.setItem('token', response.token);
                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));
                }
                navigate('/');
            }
            else if (response.error) {
                setError(response.error);
            }
            else {
                setError('Signup failed.');
            }
        }
        catch (err) {
            setError(err?.response?.data?.error || 'Signup failed.');
        }
        setLoading(false);
    };
    // Google sign-up handler
    const handleGoogleSignUp = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithProvider(googleProvider);
            if (result.success && result.user) {
                const idToken = await getUserToken();
                if (idToken) {
                    const response = await auth.googleAuth(idToken);
                    if (response.token) {
                        localStorage.setItem('token', response.token);
                        if (response.user) {
                            localStorage.setItem('user', JSON.stringify(response.user));
                        }
                        navigate('/');
                        setLoading(false);
                        return;
                    }
                    else if (response.error) {
                        setError(response.error);
                    }
                    else {
                        setError('Google sign up failed.');
                    }
                }
                else {
                    setError('Failed to get Google ID token.');
                }
            }
            else {
                setError(result.error || 'Google sign up failed.');
            }
        }
        catch (err) {
            setError(err?.message || 'Google sign up failed.');
        }
        setLoading(false);
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300", children: _jsxs("div", { className: "w-full max-w-md p-10 rounded-3xl shadow-2xl bg-white/80 border border-blue-100 backdrop-blur-md transition-all duration-300 animate-fade-in", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx("button", { onClick: () => navigate('/'), className: "focus:outline-none", children: _jsx("img", { src: "/images/logo.png", alt: "Tiyende Logo", className: "h-10 w-auto mx-auto mb-2 object-contain rounded-lg shadow", style: { background: 'white', padding: '4px' } }) }) }), _jsx("h2", { className: "text-4xl font-extrabold text-blue-700 mb-2 text-center tracking-tight font-sans", children: "Welcome to Tiyende" }), _jsx("p", { className: "text-center text-gray-500 mb-8 text-lg font-medium", children: "Create your account and start your journey" }), _jsxs("form", { onSubmit: handleSignup, className: "space-y-6", children: [_jsxs("div", { className: "relative", children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-1", children: "Username" }), _jsxs("div", { className: "flex items-center bg-white rounded-xl border border-blue-200 focus-within:ring-2 focus-within:ring-blue-400 transition px-3", children: [_jsx(FaUser, { className: "text-blue-400 mr-2" }), _jsx("input", { type: "text", value: username, onChange: e => setUsername(e.target.value), className: "w-full px-2 py-2 bg-transparent focus:outline-none rounded-xl", placeholder: "Enter your username", autoFocus: true, autoComplete: "username" })] })] }), _jsxs("div", { className: "relative", children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-1", children: "Phone Number" }), _jsxs("div", { className: "flex items-center bg-white rounded-xl border border-blue-200 focus-within:ring-2 focus-within:ring-blue-400 transition px-3", children: [_jsx(FaPhone, { className: "text-blue-400 mr-2" }), _jsx("input", { type: "tel", value: mobile, onChange: e => setMobile(e.target.value), className: "w-full px-2 py-2 bg-transparent focus:outline-none rounded-xl", placeholder: "e.g. 260900000001", autoComplete: "tel" })] })] }), _jsxs("div", { className: "relative", children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-1", children: "Password" }), _jsxs("div", { className: "flex items-center bg-white rounded-xl border border-blue-200 focus-within:ring-2 focus-within:ring-blue-400 transition px-3", children: [_jsx(FaLock, { className: "text-blue-400 mr-2" }), _jsx("input", { type: "password", value: password, onChange: e => setPassword(e.target.value), className: "w-full px-2 py-2 bg-transparent focus:outline-none rounded-xl", placeholder: "Enter your password", autoComplete: "new-password" })] })] }), error && _jsx("div", { className: "text-red-600 text-center font-medium animate-shake", children: error }), _jsx("button", { type: "submit", className: "w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 rounded-xl font-semibold text-lg shadow hover:scale-105 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50", disabled: loading, children: loading ? 'Signing up...' : 'Sign Up' })] }), _jsxs("div", { className: "flex items-center my-6", children: [_jsx("div", { className: "flex-grow border-t border-gray-200" }), _jsx("span", { className: "mx-4 text-gray-400 font-medium", children: "or continue with" }), _jsx("div", { className: "flex-grow border-t border-gray-200" })] }), _jsxs("button", { type: "button", onClick: handleGoogleSignUp, className: "w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-2 font-semibold text-gray-700 shadow hover:bg-blue-50 hover:scale-105 transition mb-2", disabled: loading, children: [_jsx(FcGoogle, { size: 24 }), " Sign up with Google"] }), _jsxs("div", { className: "text-center mt-4", children: [_jsx("span", { className: "text-gray-600", children: "Already have an account? " }), _jsx("a", { href: "/login", className: "text-blue-600 hover:underline font-medium", children: "Sign In" })] })] }) }));
};
export default SignupPage;
