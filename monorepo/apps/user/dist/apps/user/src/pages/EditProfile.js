import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { user as userApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';
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
    return (_jsxs("div", { className: "max-w-xl mx-auto py-8 px-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "Edit Profile" }), loading ? (_jsx("div", { className: "text-center py-12 text-gray-500", children: "Loading profile..." })) : (_jsxs("div", { className: "bg-white rounded-xl shadow p-6", children: [_jsx("div", { className: "flex flex-col items-center mb-6", children: _jsx("img", { src: DEFAULT_AVATAR, alt: "Avatar Preview", className: "w-24 h-24 rounded-full border-4 border-green-500 object-cover" }) }), _jsx("div", { className: "divide-y divide-gray-200", children: fields.map(field => (_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center py-4 gap-2", children: [_jsx("div", { className: "sm:w-40 font-semibold text-gray-700", children: field.label }), _jsx("div", { className: "flex-1", children: editKey === field.key ? (_jsxs("div", { className: "flex flex-col sm:flex-row gap-2 items-center", children: [_jsx("input", { type: field.type, className: "w-full sm:w-auto border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500", value: editValue, onChange: e => setEditValue(e.target.value), required: field.required, autoFocus: true }), _jsx("button", { className: "bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-semibold shadow disabled:opacity-60", onClick: handleSave, disabled: saving || !editValue.trim(), type: "button", children: "Save" }), _jsx("button", { className: "bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg font-semibold", onClick: handleCancel, type: "button", disabled: saving, children: "Cancel" })] })) : (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "text-gray-900", children: profile[field.key] || _jsx("span", { className: "italic text-gray-400", children: "Not set" }) }), _jsx("button", { className: "ml-2 text-sm text-blue-600 hover:underline font-medium", onClick: () => handleEdit(field.key), type: "button", disabled: !!editKey, children: "Edit" })] })) })] }, field.key))) }), error && _jsx("div", { className: "text-red-500 text-sm text-center mt-4", children: error }), success && _jsx("div", { className: "text-green-600 text-sm text-center mt-4", children: success }), _jsx("div", { className: "flex justify-end mt-8", children: _jsx("button", { type: "button", className: "bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold", onClick: () => navigate(-1), disabled: saving, children: "Back" }) })] }))] }));
};
export default EditProfile;
