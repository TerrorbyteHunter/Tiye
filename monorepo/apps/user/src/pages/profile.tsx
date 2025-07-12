import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { user, tickets } from '../lib/api';
import { LogOut, User2, Pencil, Bell, HelpCircle, Ticket } from 'lucide-react';

const tiles = [
  { to: '/profile/edit', icon: <Pencil className="h-6 w-6 text-blue-600" />, label: 'Edit Profile' },
  { to: '/my-bookings', icon: <Ticket className="h-6 w-6 text-purple-600" />, label: 'My Bookings' },
  { to: '/notifications', icon: <Bell className="h-6 w-6 text-green-600" />, label: 'Notifications' },
  { to: '/support', icon: <HelpCircle className="h-6 w-6 text-yellow-500" />, label: 'Help/FAQ' },
];

const ProfileMain: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const userRes = await user.getMe();
        setProfile(userRes.data);
      } catch (err: any) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white py-10 px-2">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <User2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-8" />
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading profile...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <>
            {/* User Info Card */}
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-xl border border-blue-100 p-8 mb-8">
              <img src="/images/avatar.png" alt="User Avatar" className="w-28 h-28 rounded-full border-4 border-blue-400 mb-3 shadow" />
              <h2 className="text-2xl font-bold text-gray-900">{profile?.fullName || profile?.name || 'User'}</h2>
              <p className="text-gray-500 text-base">{profile?.email || ''}</p>
            </div>
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-5 mb-10">
              {tiles.map(tile => (
                <ProfileTile key={tile.to} to={tile.to} icon={tile.icon} label={tile.label} />
              ))}
            </div>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg font-semibold rounded-lg shadow hover:from-red-600 hover:to-pink-600 transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

function ProfileTile({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center bg-white rounded-xl shadow p-6 hover:bg-blue-50 hover:shadow-lg transition gap-2 border border-blue-100"
    >
      <span className="mb-1">{icon}</span>
      <span className="font-medium text-gray-700 text-base">{label}</span>
    </Link>
  );
}

export default ProfileMain; 