import React, { useEffect, useState } from 'react';
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

const EditProfile: React.FC = () => {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
  const [editKey, setEditKey] = useState<string | null>(null);
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
      } catch (err: any) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = (key: string) => {
    setEditKey(key);
    setEditValue(profile[key as keyof typeof profile] || '');
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditKey(null);
    setEditValue('');
    setError('');
  };

  const handleSave = async () => {
    if (!editKey) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Map 'name' to 'fullName' for backend
      const payload: any = {};
      if (editKey === 'name') {
        payload.fullName = editValue;
      } else {
        payload[editKey] = editValue;
      }
      await userApi.updateMe(payload);
      setProfile(prev => ({ ...prev, [editKey]: editValue }));
      setSuccess('Profile updated successfully!');
      setEditKey(null);
      setEditValue('');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white py-6 px-2 flex flex-col items-center">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-extrabold text-blue-700 mb-4 text-center tracking-tight">Edit Your Profile</h1>
        {/* Card */}
        <div className="flex flex-col items-center bg-white rounded-2xl shadow-xl border border-blue-100 p-6 mb-8">
          {/* Avatar */}
          <div className="relative mb-4">
            <img
              src={DEFAULT_AVATAR}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full border-4 border-blue-400 object-cover shadow-md mx-auto"
            />
            <button
              className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 transition"
              title="Change avatar"
              style={{ zIndex: 2 }}
              disabled
            >
              <FaCamera />
            </button>
          </div>
          {/* Profile Fields */}
          <div className="w-full divide-y divide-gray-200">
            {fields.map(field => (
              <div key={field.key} className="flex flex-col sm:flex-row sm:items-center py-4 gap-2">
                <div className="sm:w-40 font-semibold text-gray-700 text-sm uppercase tracking-wide">{field.label}</div>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-gray-900 text-base">{profile[field.key as keyof typeof profile] || <span className="italic text-gray-400">Not set</span>}</span>
                  <button
                    className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition"
                    onClick={() => handleEdit(field.key)}
                    type="button"
                    disabled={!!editKey}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
          {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center mt-4">{success}</div>}
        </div>
        {/* Edit Field Modal (inline for mobile) */}
        {editKey && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs mx-auto flex flex-col items-center">
              <h2 className="text-lg font-bold mb-2">Edit {fields.find(f => f.key === editKey)?.label}</h2>
              <input
                type={fields.find(f => f.key === editKey)?.type || 'text'}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                required={fields.find(f => f.key === editKey)?.required}
                autoFocus
              />
              <div className="flex gap-2 w-full">
                <button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
                  onClick={handleSave}
                  disabled={saving || !editValue.trim()}
                  type="button"
                >
                  Save
                </button>
                <button
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                  onClick={handleCancel}
                  type="button"
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
              {error && <div className="text-red-500 text-xs text-center mt-2">{error}</div>}
            </div>
          </div>
        )}
        {/* Back Button */}
        <button
          type="button"
          className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl font-semibold text-lg shadow"
          onClick={() => navigate(-1)}
          disabled={saving}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default EditProfile; 