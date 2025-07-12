import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, User, Mail, Phone, MapPin, Save, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const EditProfile: React.FC = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Admin User',
    email: 'admin@tiyende.com',
    phone: '+260 955 123 456',
    address: 'Lusaka, Zambia'
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = async (field: string) => {
    try {
      // In a real app, make API call to update the field
      const updatedProfile = { ...profile, [field]: tempValue };
      setProfile(updatedProfile);
      setEditingField(null);
      
      toast({
        title: "Profile updated",
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const renderField = (field: keyof ProfileData, label: string, icon: React.ReactNode, type: string = 'text') => {
    const isEditing = editingField === field;
    const value = profile[field];

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">{label}</Label>
            {!isEditing && (
              <p className="text-sm text-gray-500 mt-1">{value || 'Not set'}</p>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <Input
              type={type}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleSave(field)}
                className="flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(field, value)}
            className="w-full"
          >
            Edit {label}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href="/profile">
          <Button variant="ghost" className="mb-4 flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
        <p className="text-gray-600">Update your personal information</p>
      </div>

      {/* Profile Fields */}
      <div className="space-y-6">
        {renderField('name', 'Full Name', <User className="w-5 h-5 text-blue-600" />)}
        {renderField('email', 'Email Address', <Mail className="w-5 h-5 text-blue-600" />, 'email')}
        {renderField('phone', 'Phone Number', <Phone className="w-5 h-5 text-blue-600" />, 'tel')}
        {renderField('address', 'Address', <MapPin className="w-5 h-5 text-blue-600" />)}
      </div>

      {/* Profile Avatar Section */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
            <p className="text-sm text-gray-500">Upload a new profile picture</p>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm">
            Change Picture
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile; 