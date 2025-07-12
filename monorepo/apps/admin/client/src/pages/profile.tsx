import React from 'react';
import { Link } from 'wouter';
import { User, Bell, Settings, HelpCircle, BarChart3, LogOut, Shield, Activity } from 'lucide-react';

const tiles = [
  { to: '/profile/edit', icon: User, label: 'Edit Profile', color: 'bg-blue-500', description: 'Update your personal information' },
  { to: '/profile/notifications', icon: Bell, label: 'Notifications', color: 'bg-green-500', description: 'Manage notification preferences' },
  { to: '/settings', icon: Settings, label: 'Settings', color: 'bg-purple-500', description: 'Configure system settings' },
  { to: '/support', icon: HelpCircle, label: 'Support', color: 'bg-orange-500', description: 'Get help and support' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', color: 'bg-indigo-500', description: 'View system analytics' },
];

const ProfileHub: React.FC = () => {
  // In a real app, fetch admin profile info here
  const profile = { 
    name: 'Admin User', 
    email: 'admin@tiyende.com',
    role: 'System Administrator'
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl mb-8 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Profile Hub</h1>
              <p className="text-indigo-100">Manage your account and system preferences</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="hidden md:block w-1 h-12 bg-white/30 rounded-full"></div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xl font-bold">{profile.name}</div>
                  <div className="text-sm text-indigo-200">{profile.email}</div>
                  <span className="inline-block mt-1 px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Shield className="mr-2 h-4 w-4" />
                Security
              </button>
              <button className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Activity className="mr-2 h-4 w-4" />
                Activity
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Navigation Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiles.map(tile => (
            <ProfileTile 
              key={tile.to} 
              to={tile.to} 
              icon={tile.icon} 
              label={tile.label} 
              color={tile.color}
              description={tile.description}
            />
          ))}
        </div>

        {/* Logout Button */}
        <div className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-xl p-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

function ProfileTile({ 
  to, 
  icon: Icon, 
  label, 
  color,
  description
}: { 
  to: string; 
  icon: React.ComponentType<any>; 
  label: string; 
  color: string;
  description: string;
}) {
  return (
    <Link href={to}>
      <div className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className={`${color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-800 group-hover:text-gray-900 transition-colors">{label}</h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProfileHub; 