import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/api';
import { signInWithProvider, googleProvider, getUserToken } from '../lib/firebase';
import { FcGoogle } from 'react-icons/fc';
import { FaUser, FaPhone, FaLock } from 'react-icons/fa';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
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
      } else {
        setError('Invalid credentials.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed.');
    }
    setLoading(false);
  };

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
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
          } else if (response.error) {
            setError(response.error);
          } else {
            setError('Google sign-in failed.');
          }
        } else {
          setError('Failed to get Google ID token.');
        }
      } else {
        setError(result.error || 'Google sign-in failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300">
      <div className="w-full max-w-md p-10 rounded-3xl shadow-2xl bg-white/80 border border-blue-100 backdrop-blur-md transition-all duration-300 animate-fade-in">
        <div className="flex justify-center mb-4">
          <button onClick={() => navigate('/')} className="focus:outline-none">
            <img
              src="/images/logo.png"
              alt="Tiyende Logo"
              className="h-10 w-auto mx-auto mb-2 object-contain rounded-lg shadow"
              style={{ background: 'white', padding: '4px' }}
            />
          </button>
        </div>
        <h2 className="text-4xl font-extrabold text-blue-700 mb-2 text-center tracking-tight font-sans">Welcome to Tiyende</h2>
        <p className="text-center text-gray-500 mb-8 text-lg font-medium">Your smart way to book bus tickets in Zambia</p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-1">Username</label>
            <div className="flex items-center bg-white rounded-xl border border-blue-200 focus-within:ring-2 focus-within:ring-blue-400 transition px-3">
              <FaUser className="text-blue-400 mr-2" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-2 py-2 bg-transparent focus:outline-none rounded-xl"
                placeholder="Enter your username"
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
            <div className="flex items-center bg-white rounded-xl border border-blue-200 focus-within:ring-2 focus-within:ring-blue-400 transition px-3">
              <FaPhone className="text-blue-400 mr-2" />
              <input
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                className="w-full px-2 py-2 bg-transparent focus:outline-none rounded-xl"
                placeholder="e.g. 260900000001"
                autoComplete="tel"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-1">Password</label>
            <div className="flex items-center bg-white rounded-xl border border-blue-200 focus-within:ring-2 focus-within:ring-blue-400 transition px-3">
              <FaLock className="text-blue-400 mr-2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-2 py-2 bg-transparent focus:outline-none rounded-xl"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
          </div>
          {error && <div className="text-red-600 text-center font-medium animate-shake">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 rounded-xl font-semibold text-lg shadow hover:scale-105 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-gray-400 font-medium">or continue with</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-2 font-semibold text-gray-700 shadow hover:bg-blue-50 hover:scale-105 transition mb-2"
          disabled={loading}
        >
          <FcGoogle size={24} /> Sign in with Google
        </button>
        <div className="text-center mt-4">
          <span className="text-gray-600">Don't have an account? </span>
          <a href="/signup" className="text-blue-600 hover:underline font-medium">Sign Up</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 