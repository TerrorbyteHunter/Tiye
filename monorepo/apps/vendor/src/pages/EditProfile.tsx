import React, { useEffect, useState } from 'react';
import { vendor } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = '/images/avatar.png';

const fields = [
  { key: 'name', label: 'Company Name', type: 'text', required: true },
  { key: 'contactPerson', label: 'Contact Person', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'phone', label: 'Phone', type: 'tel', required: true },
  { key: 'address', label: 'Address', type: 'text', required: false },
];

const EditProfile: React.FC = () => {
  const [profile, setProfile] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '' });
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
        const res = await vendor.getProfile();
        const { name, contactPerson, email, phone, address } = res.data;
        setProfile({ name: name || '', contactPerson: contactPerson || '', email: email || '', phone: phone || '', address: address || '' });
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
      const payload: any = {};
      payload[editKey] = editValue;
      await vendor.updateProfile(payload);
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
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading profile...</div>
      ) : (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col items-center mb-6">
            <img
              src={DEFAULT_AVATAR}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full border-4 border-green-500 object-cover"
            />
          </div>
          <div className="divide-y divide-gray-200">
            {fields.map(field => (
              <div key={field.key} className="flex flex-col sm:flex-row sm:items-center py-4 gap-2">
                <div className="sm:w-40 font-semibold text-gray-700">{field.label}</div>
                <div className="flex-1">
                  {editKey === field.key ? (
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type={field.type}
                        className="w-full sm:w-auto border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        required={field.required}
                        autoFocus
                      />
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-semibold shadow disabled:opacity-60"
                        onClick={handleSave}
                        disabled={saving || !editValue.trim()}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg font-semibold"
                        onClick={handleCancel}
                        type="button"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="text-gray-900">{profile[field.key as keyof typeof profile] || <span className="italic text-gray-400">Not set</span>}</span>
                      <button
                        className="ml-2 text-sm text-blue-600 hover:underline font-medium"
                        onClick={() => handleEdit(field.key)}
                        type="button"
                        disabled={!!editKey}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center mt-4">{success}</div>}
          <div className="flex justify-end mt-8">
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile; 