import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { user } from '../lib/api';
import { LogOut, User2, Pencil, Bell, HelpCircle, Ticket } from 'lucide-react';
const tiles = [
    { to: '/profile/edit', icon: _jsx(Pencil, { className: "h-6 w-6 text-blue-600" }), label: 'Edit Profile' },
    { to: '/my-bookings', icon: _jsx(Ticket, { className: "h-6 w-6 text-purple-600" }), label: 'My Bookings' },
    { to: '/notifications', icon: _jsx(Bell, { className: "h-6 w-6 text-green-600" }), label: 'Notifications' },
    { to: '/support', icon: _jsx(HelpCircle, { className: "h-6 w-6 text-yellow-500" }), label: 'Help/FAQ' },
];
const ProfileMain = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError('');
            try {
                const userRes = await user.getMe();
                setProfile(userRes.data);
            }
            catch (err) {
                setError('Failed to load profile.');
            }
            finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white py-10 px-2", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(User2, { className: "h-8 w-8 text-blue-600" }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "My Profile" })] }), _jsx("div", { className: "h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-8" }), loading ? (_jsx("div", { className: "text-center py-12 text-gray-500", children: "Loading profile..." })) : error ? (_jsx("div", { className: "text-center py-12 text-red-500", children: error })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col items-center bg-white rounded-2xl shadow-xl border border-blue-100 p-8 mb-8", children: [_jsx("img", { src: "/images/avatar.png", alt: "User Avatar", className: "w-28 h-28 rounded-full border-4 border-blue-400 mb-3 shadow" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: profile?.fullName || profile?.name || 'User' }), _jsx("p", { className: "text-gray-500 text-base", children: profile?.email || '' })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-2 gap-5 mb-10", children: tiles.map(tile => (_jsx(ProfileTile, { to: tile.to, icon: tile.icon, label: tile.label }, tile.to))) }), _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg font-semibold rounded-lg shadow hover:from-red-600 hover:to-pink-600 transition", children: [_jsx(LogOut, { className: "w-5 h-5" }), "Logout"] })] }))] }) }));
};
function ProfileTile({ to, icon, label }) {
    return (_jsxs(Link, { to: to, className: "flex flex-col items-center justify-center bg-white rounded-xl shadow p-6 hover:bg-blue-50 hover:shadow-lg transition gap-2 border border-blue-100", children: [_jsx("span", { className: "mb-1", children: icon }), _jsx("span", { className: "font-medium text-gray-700 text-base", children: label })] }));
}
export default ProfileMain;
