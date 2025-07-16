import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { user as userApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaMapMarkerAlt } from 'react-icons/fa';
const DEFAULT_AVATAR = '/images/avatar.png';
const EditProfile = () => {
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', city: '' });
    const [editSection, setEditSection] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const avatarOptions = [
        '/images/Avatar/avatar1.png',
        '/images/Avatar/avatar2.png',
        '/images/Avatar/avatar3.png',
        '/images/Avatar/avatar4.png',
        '/images/Avatar/avatar5.png',
        '/images/Avatar/avatar6.png',
    ];
    const [avatar, setAvatar] = useState(() => {
        return localStorage.getItem('selectedAvatar') || avatarOptions[0];
    });
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await userApi.getMe();
                const name = res.data.fullName || res.data.name || '';
                const email = res.data.email || '';
                const phone = res.data.phone || res.data.mobile || '';
                const address = res.data.address || '';
                const city = res.data.city || '';
                setProfile({ name, email, phone, address, city });
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
    const handleEditSection = (section) => {
        setEditSection(section);
        setEditValues({ ...profile });
        setError('');
        setSuccess('');
    };
    const handleCancel = () => {
        setEditSection(null);
        setEditValues({});
        setError('');
    };
    const handleChange = (key, value) => {
        setEditValues((prev) => ({ ...prev, [key]: value }));
    };
    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            let payload = {};
            if (editSection === 'personal') {
                payload.name = editValues.name;
                payload.fullName = editValues.name;
                payload.email = editValues.email;
            }
            else if (editSection === 'address') {
                payload.address = editValues.address;
                payload.city = editValues.city;
            }
            await userApi.updateMe(payload);
            setProfile((prev) => ({ ...prev, ...editValues }));
            setSuccess('Profile updated successfully!');
            setEditSection(null);
            setTimeout(() => setSuccess(''), 2000);
        }
        catch (err) {
            setError('Failed to update profile.');
        }
        finally {
            setSaving(false);
        }
    };
    const handleAvatarClick = () => {
        setShowAvatarModal(true);
    };
    const handleSelectAvatar = (avatarPath) => {
        setAvatar(avatarPath);
        localStorage.setItem('selectedAvatar', avatarPath);
        setShowAvatarModal(false);
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white py-6 px-2 flex flex-col items-center", children: [_jsxs("div", { className: "w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-blue-100 p-6 mb-8 flex flex-col sm:flex-row items-center gap-6", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: avatar, alt: "Avatar Preview", className: "w-24 h-24 rounded-full border-4 border-blue-400 object-cover shadow-md" }), _jsx("button", { className: "absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 transition", title: "Change avatar", style: { zIndex: 2 }, onClick: handleAvatarClick, type: "button", children: _jsx(FaCamera, {}) })] }), _jsxs("div", { className: "flex-1 flex flex-col items-center sm:items-start", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-1", children: profile.name || 'User' }), _jsxs("div", { className: "text-gray-500 text-base flex items-center gap-2", children: [_jsx(FaMapMarkerAlt, { className: "inline-block mr-1" }), " ", profile.city] }), _jsx("button", { className: "mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition text-sm", onClick: handleAvatarClick, type: "button", children: "Change Avatar" })] })] }), showAvatarModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto flex flex-col items-center", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "Choose Your Avatar" }), _jsx("div", { className: "grid grid-cols-3 gap-4 mb-4", children: avatarOptions.map((option) => (_jsx("button", { className: `rounded-full border-4 ${avatar === option ? 'border-blue-500' : 'border-transparent'} focus:outline-none`, onClick: () => handleSelectAvatar(option), type: "button", children: _jsx("img", { src: option, alt: "Avatar option", className: "w-20 h-20 rounded-full object-cover" }) }, option))) }), _jsx("button", { className: "mt-2 px-4 py-1 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition text-sm", onClick: () => setShowAvatarModal(false), type: "button", children: "Cancel" })] }) })), _jsxs("div", { className: "w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-blue-100 p-6 mb-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800", children: "Personal Information" }), _jsx("button", { className: "px-4 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition", onClick: () => handleEditSection('personal'), disabled: !!editSection, children: "Edit" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Full Name:" }), " ", profile.name] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Email Address:" }), " ", profile.email] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Phone Number:" }), " ", profile.phone] })] })] }), _jsxs("div", { className: "w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-blue-100 p-6 mb-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800", children: "Address" }), _jsx("button", { className: "px-4 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition", onClick: () => handleEditSection('address'), disabled: !!editSection, children: "Edit" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "City:" }), " ", profile.city] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("span", { className: "font-semibold", children: "Address:" }), " ", profile.address] })] })] }), success && _jsx("div", { className: "text-green-600 text-sm text-center mt-4", children: success }), editSection && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs mx-auto flex flex-col items-center", children: [_jsxs("h2", { className: "text-lg font-bold mb-2", children: ["Edit ", editSection === 'personal' ? 'Personal Information' : 'Address'] }), editSection === 'personal' && (_jsxs(_Fragment, { children: [_jsx("input", { type: "text", className: "w-full border rounded-lg px-3 py-2 mb-3", placeholder: "Full Name", value: editValues.name, onChange: e => handleChange('name', e.target.value), required: true }), _jsx("input", { type: "email", className: "w-full border rounded-lg px-3 py-2 mb-3", placeholder: "Email Address", value: editValues.email, onChange: e => handleChange('email', e.target.value), required: true }), _jsx("input", { type: "tel", className: "w-full border rounded-lg px-3 py-2 mb-3 bg-gray-100 cursor-not-allowed", placeholder: "Phone Number", value: profile.phone, disabled: true })] })), editSection === 'address' && (_jsxs(_Fragment, { children: [_jsx("input", { type: "text", className: "w-full border rounded-lg px-3 py-2 mb-3", placeholder: "City", value: editValues.city, onChange: e => handleChange('city', e.target.value) }), _jsx("input", { type: "text", className: "w-full border rounded-lg px-3 py-2 mb-3", placeholder: "Address", value: editValues.address, onChange: e => handleChange('address', e.target.value) })] })), _jsxs("div", { className: "flex gap-2 w-full", children: [_jsx("button", { className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow", onClick: handleSave, disabled: saving, type: "button", children: "Save" }), _jsx("button", { className: "flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold", onClick: handleCancel, type: "button", disabled: saving, children: "Cancel" })] }), error && _jsx("div", { className: "text-red-500 text-xs text-center mt-2", children: error })] }) })), _jsx("button", { type: "button", className: "w-full max-w-2xl mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl font-semibold text-lg shadow", onClick: () => navigate(-1), disabled: saving, children: "Back" })] }));
};
export default EditProfile;
