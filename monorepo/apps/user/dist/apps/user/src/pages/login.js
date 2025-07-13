import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/api';
const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!username.trim() || !mobile.trim() || !password.trim()) {
            setError('All fields are required.');
            return;
        }
        setLoading(true);
        try {
            const response = await auth.login({ username: username.trim(), mobile: mobile.trim(), password });
            if (response.token) {
                localStorage.setItem('token', response.token);
                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));
                }
                navigate('/');
            }
            else {
                setError('Invalid credentials.');
            }
        }
        catch (err) {
            setError(err?.response?.data?.error || 'Login failed.');
        }
        setLoading(false);
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200", children: _jsxs("div", { className: "w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white border border-blue-100", children: [_jsx("h2", { className: "text-4xl font-bold text-blue-700 mb-2 text-center tracking-tight", children: "Welcome to Tiyende" }), _jsx("p", { className: "text-center text-gray-500 mb-8", children: "Sign in to your account" }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-medium mb-1", children: "Username" }), _jsx("input", { type: "text", value: username, onChange: e => setUsername(e.target.value), className: "w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition", placeholder: "Enter your username", autoFocus: true, autoComplete: "username" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-medium mb-1", children: "Phone Number" }), _jsx("input", { type: "tel", value: mobile, onChange: e => setMobile(e.target.value), className: "w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition", placeholder: "e.g. 260900000001", autoComplete: "tel" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-medium mb-1", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: e => setPassword(e.target.value), className: "w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition", placeholder: "Enter your password", autoComplete: "current-password" })] }), error && _jsx("div", { className: "text-red-600 text-center font-medium", children: error }), _jsx("button", { type: "submit", className: "w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition disabled:opacity-50", disabled: loading, children: loading ? 'Signing in...' : 'Sign In' })] }), _jsxs("div", { className: "text-center mt-4", children: [_jsx("span", { className: "text-gray-600", children: "Don't have an account? " }), _jsx("a", { href: "/signup", className: "text-blue-600 hover:underline font-medium", children: "Sign Up" })] })] }) }));
};
export default LoginPage;
