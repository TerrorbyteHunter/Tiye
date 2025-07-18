import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { user } from '../lib/api';
import { LogOut, User2, Pencil, Bell, HelpCircle, Ticket } from 'lucide-react';
import { useIsMobile } from '../hooks/use-responsive';
import ReactDOM from 'react-dom';
const tiles = [
    { to: '/profile/edit', icon: _jsx(Pencil, { className: "h-6 w-6 text-blue-600" }), label: 'Edit Profile' },
    { to: '/my-bookings', icon: _jsx(Ticket, { className: "h-6 w-6 text-purple-600" }), label: 'My Bookings' },
    { to: '/notifications', icon: _jsx(Bell, { className: "h-6 w-6 text-green-600" }), label: 'Notifications' },
    { to: '/support', icon: _jsx(HelpCircle, { className: "h-6 w-6 text-yellow-500" }), label: 'Help/FAQ' },
];
const ProfileMain = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
    // Add avatar selection logic
    const avatarOptions = [
        '/images/Avatar/avatar1.png',
        '/images/Avatar/avatar2.png',
        '/images/Avatar/avatar3.png',
        '/images/Avatar/avatar4.png',
        '/images/Avatar/avatar5.png',
        '/images/Avatar/avatar6.png',
    ];
    const avatar = localStorage.getItem('selectedAvatar') || avatarOptions[0];
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white py-10 px-2", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsx("div", { className: "flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-200 shadow", children: _jsx(User2, { className: "h-7 w-7 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-extrabold text-gray-900 tracking-tight", children: "My Profile" }), _jsx("div", { className: "h-1 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mt-1 shadow" })] })] }), loading ? (_jsx("div", { className: "text-center py-12 text-gray-500", children: "Loading profile..." })) : error ? (_jsx("div", { className: "text-center py-12 text-red-500", children: error })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col items-center bg-white rounded-2xl shadow-xl border border-blue-100 p-8 mb-8", children: [_jsx("img", { src: avatar, alt: "User Avatar", className: "w-28 h-28 rounded-full border-4 border-blue-400 mb-3 shadow" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: profile?.fullName || profile?.name || '' }), _jsx("p", { className: "text-gray-500 text-base", children: profile?.email || '' })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-2 gap-5 mb-10", children: tiles.map(tile => (_jsx(ProfileTile, { to: tile.to, icon: tile.icon, label: tile.label }, tile.to))) }), isMobile && (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setShowLogoutConfirm(true), className: "w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg font-semibold rounded-lg shadow hover:from-red-600 hover:to-pink-600 transition mt-4", children: [_jsx(LogOut, { className: "w-5 h-5" }), "Logout"] }), showLogoutConfirm && (_jsx(LogoutConfirmModal, { onConfirm: handleLogout, onCancel: () => setShowLogoutConfirm(false) }))] }))] }))] }) }));
};
function ProfileTile({ to, icon, label }) {
    return (_jsxs(Link, { to: to, className: "flex flex-col items-center justify-center bg-white rounded-xl shadow p-6 hover:bg-blue-50 hover:shadow-lg transition gap-2 border border-blue-100", children: [_jsx("span", { className: "mb-1", children: icon }), _jsx("span", { className: "font-medium text-gray-700 text-base", children: label })] }));
}
// Simple logout confirmation modal
function LogoutConfirmModal({ onConfirm, onCancel }) {
    return ReactDOM.createPortal(_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 w-full max-w-xs mx-auto relative", children: [_jsx("h2", { className: "text-lg font-bold mb-4 text-center", children: "Confirm Logout" }), _jsx("p", { className: "mb-6 text-center text-gray-700", children: "Are you sure you want to log out?" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: onCancel, className: "flex-1 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition", children: "Cancel" }), _jsx("button", { onClick: onConfirm, className: "flex-1 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition", children: "Log Out" })] })] }) }), document.body);
}
export default ProfileMain;
