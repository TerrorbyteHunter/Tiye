import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const tiles = [
  { to: '/profile/edit', icon: '👤', label: 'Edit Profile' },
  { to: '/profile/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
  { to: '/support', icon: '❓', label: 'Support' },
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
];

const ProfileHub: React.FC = () => {
  const navigate = useNavigate();
  // In a real app, fetch vendor profile info here
  const profile = { name: 'Vendor', email: 'vendor@email.com' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">More</h1>
      <div className="flex flex-col items-center mb-8">
        <img src="/images/avatar.png" alt="Vendor Avatar" className="w-24 h-24 rounded-full border-4 border-green-500 mb-2" />
        <h2 className="text-2xl font-bold">{profile.name}</h2>
        <p className="text-gray-500">{profile.email}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {tiles.map(tile => (
          <ProfileTile key={tile.to} to={tile.to} icon={tile.icon} label={tile.label} />
        ))}
      </div>
      <button onClick={handleLogout} className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition">Logout</button>
    </div>
  );
};

function ProfileTile({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center bg-white rounded-lg shadow p-4 hover:bg-green-50 transition">
      <span className="text-3xl mb-2">{icon}</span>
      <span className="font-medium text-gray-700">{label}</span>
    </Link>
  );
}

export default ProfileHub; 