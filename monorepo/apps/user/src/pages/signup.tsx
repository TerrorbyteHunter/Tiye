import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/api';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
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
      } else if (response.error) {
        setError(response.error);
      } else {
        setError('Signup failed.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Signup failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white border border-blue-100">
        <h2 className="text-4xl font-bold text-blue-700 mb-2 text-center tracking-tight">Sign Up for Tiyende</h2>
        <p className="text-center text-gray-500 mb-8">Create your account</p>
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter your username"
              autoFocus
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="e.g. 260900000001"
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter your password"
              autoComplete="new-password"
            />
          </div>
          {error && <div className="text-red-600 text-center font-medium">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage; 