import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { user as userApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { FaCamera } from 'react-icons/fa';
const DEFAULT_AVATAR = '/images/avatar.png';
const fields = [
    { key: 'name', label: 'Full Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'phone', label: 'Phone', type: 'tel', required: true },
    { key: 'address', label: 'Address', type: 'text', required: false },
];
const EditProfile = () => {
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
    const [editKey, setEditKey] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await userApi.getMe();
                const name = res.data.fullName || res.data.name || '';
                const email = res.data.email || '';
                const phone = res.data.phone || '';
                const address = res.data.address || '';
                setProfile({ name, email, phone, address });
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
    const handleEdit = (key) => {
        setEditKey(key);
        setEditValue(profile[key] || '');
        setError('');
        setSuccess('');
    };
    const handleCancel = () => {
        setEditKey(null);
        setEditValue('');
        setError('');
    };
    const handleSave = async () => {
        if (!editKey)
            return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            // Map 'name' to 'fullName' for backend
            const payload = {};
            if (editKey === 'name') {
                payload.fullName = editValue;
            }
            else {
                payload[editKey] = editValue;
            }
            await userApi.updateMe(payload);
            setProfile(prev => ({ ...prev, [editKey]: editValue }));
            setSuccess('Profile updated successfully!');
            setEditKey(null);
            setEditValue('');
            setTimeout(() => setSuccess(''), 2000);
        }
        catch (err) {
            setError('Failed to update profile.');
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white py-6 px-2 flex flex-col items-center", children: _jsxs("div", { className: "w-full max-w-md mx-auto", children: [_jsx("h1", { className: "text-2xl font-extrabold text-blue-700 mb-4 text-center tracking-tight", children: "Edit Your Profile" }), _jsxs("div", { className: "flex flex-col items-center bg-white rounded-2xl shadow-xl border border-blue-100 p-6 mb-8", children: [_jsxs("div", { className: "relative mb-4", children: [_jsx("img", { src: DEFAULT_AVATAR, alt: "Avatar Preview", className: "w-24 h-24 rounded-full border-4 border-blue-400 object-cover shadow-md mx-auto" }), _jsx("button", { className: "absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 transition", title: "Change avatar", style: { zIndex: 2 }, disabled: true, children: _jsx(FaCamera, {}) })] }), _jsx("div", { className: "w-full divide-y divide-gray-200", children: fields.map(field => (_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center py-4 gap-2", children: [_jsx("div", { className: "sm:w-40 font-semibold text-gray-700 text-sm uppercase tracking-wide", children: field.label }), _jsxs("div", { className: "flex-1 flex items-center gap-2", children: [_jsx("span", { className: "text-gray-900 text-base", children: profile[field.key] || _jsx("span", { className: "italic text-gray-400", children: "Not set" }) }), _jsx("button", { className: "ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition", onClick: () => handleEdit(field.key), type: "button", disabled: !!editKey, children: "Edit" })] })] }, field.key))) }), error && _jsx("div", { className: "text-red-500 text-sm text-center mt-4", children: error }), success && _jsx("div", { className: "text-green-600 text-sm text-center mt-4", children: success })] }), editKey && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs mx-auto flex flex-col items-center", children: [_jsxs("h2", { className: "text-lg font-bold mb-2", children: ["Edit ", fields.find(f => f.key === editKey)?.label] }), _jsx("input", { type: fields.find(f => f.key === editKey)?.type || 'text', className: "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4", value: editValue, onChange: e => setEditValue(e.target.value), required: fields.find(f => f.key === editKey)?.required, autoFocus: true }), _jsxs("div", { className: "flex gap-2 w-full", children: [_jsx("button", { className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow", onClick: handleSave, disabled: saving || !editValue.trim(), type: "button", children: "Save" }), _jsx("button", { className: "flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold", onClick: handleCancel, type: "button", disabled: saving, children: "Cancel" })] }), error && _jsx("div", { className: "text-red-500 text-xs text-center mt-2", children: error })] }) })), _jsx("button", { type: "button", className: "w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl font-semibold text-lg shadow", onClick: () => navigate(-1), disabled: saving, children: "Back" })] }) }));
};
export default EditProfile;
