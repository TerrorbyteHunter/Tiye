import React, { useEffect, useState } from 'react';
import { user as userApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserShield, FaHome } from 'react-icons/fa';

const DEFAULT_AVATAR = '/images/avatar.png';

const EditProfile: React.FC = () => {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', city: '' });
  const [editSection, setEditSection] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
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
  const [avatar, setAvatar] = useState<string>(() => {
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
      } catch (err: any) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditSection = (section: string) => {
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

  const handleChange = (key: string, value: string) => {
    setEditValues((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      let payload: any = {};
      if (editSection === 'personal') {
        payload.name = editValues.name;
        payload.fullName = editValues.name;
        payload.email = editValues.email;
      } else if (editSection === 'address') {
        payload.address = editValues.address;
        payload.city = editValues.city;
      }
      await userApi.updateMe(payload);
      setProfile((prev) => ({ ...prev, ...editValues }));
      setSuccess('Profile updated successfully!');
      setEditSection(null);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const handleSelectAvatar = (avatarPath: string) => {
    setAvatar(avatarPath);
    localStorage.setItem('selectedAvatar', avatarPath);
    setShowAvatarModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white py-6 px-2 flex flex-col items-center">
      {/* Profile Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-blue-100 p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={avatar}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full border-4 border-blue-400 object-cover shadow-md"
          />
          <button
            className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 transition"
            title="Change avatar"
            style={{ zIndex: 2 }}
            onClick={handleAvatarClick}
            type="button"
          >
            <FaCamera />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center sm:items-start">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name || 'User'}</h2>
          <div className="text-gray-500 text-base flex items-center gap-2"><FaMapMarkerAlt className="inline-block mr-1" /> {profile.city}</div>
          <button
            className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition text-sm"
            onClick={handleAvatarClick}
            type="button"
          >
            Change Avatar
          </button>
        </div>
      </div>
      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4">Choose Your Avatar</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {avatarOptions.map((option) => (
                <button
                  key={option}
                  className={`rounded-full border-4 ${avatar === option ? 'border-blue-500' : 'border-transparent'} focus:outline-none`}
                  onClick={() => handleSelectAvatar(option)}
                  type="button"
                >
                  <img src={option} alt="Avatar option" className="w-20 h-20 rounded-full object-cover" />
                </button>
              ))}
            </div>
            <button
              className="mt-2 px-4 py-1 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition text-sm"
              onClick={() => setShowAvatarModal(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Personal Information Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-blue-100 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
          <button
            className="px-4 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            onClick={() => handleEditSection('personal')}
            disabled={!!editSection}
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <div><span className="font-semibold">Full Name:</span> {profile.name}</div>
          <div><span className="font-semibold">Email Address:</span> {profile.email}</div>
          <div><span className="font-semibold">Phone Number:</span> {profile.phone}</div>
        </div>
      </div>
      {/* Address Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-blue-100 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Address</h3>
          <button
            className="px-4 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            onClick={() => handleEditSection('address')}
            disabled={!!editSection}
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <div><span className="font-semibold">City:</span> {profile.city}</div>
          <div className="sm:col-span-2"><span className="font-semibold">Address:</span> {profile.address}</div>
        </div>
      </div>
      {/* Success Message */}
      {success && <div className="text-green-600 text-sm text-center mt-4">{success}</div>}
      {/* Edit Modal */}
      {editSection && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs mx-auto flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2">Edit {editSection === 'personal' ? 'Personal Information' : 'Address'}</h2>
            {editSection === 'personal' && (
              <>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                  placeholder="Full Name"
                  value={editValues.name}
                  onChange={e => handleChange('name', e.target.value)}
                  required
                />
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                  placeholder="Email Address"
                  value={editValues.email}
                  onChange={e => handleChange('email', e.target.value)}
                  required
                />
                <input
                  type="tel"
                  className="w-full border rounded-lg px-3 py-2 mb-3 bg-gray-100 cursor-not-allowed"
                  placeholder="Phone Number"
                  value={profile.phone}
                  disabled
                />
              </>
            )}
            {editSection === 'address' && (
              <>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                  placeholder="City"
                  value={editValues.city}
                  onChange={e => handleChange('city', e.target.value)}
                />
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                  placeholder="Address"
                  value={editValues.address}
                  onChange={e => handleChange('address', e.target.value)}
                />
              </>
            )}
            <div className="flex gap-2 w-full">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
                onClick={handleSave}
                disabled={saving}
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
        className="w-full max-w-2xl mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl font-semibold text-lg shadow"
        onClick={() => navigate(-1)}
        disabled={saving}
      >
        Back
      </button>
    </div>
  );
};

export default EditProfile; 