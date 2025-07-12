import * as React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendor } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Image, Upload, Save, Loader2, Building, Bell, Paintbrush } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

interface VendorSettings {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string>('');
  const [isUploading, setIsUploading] = React.useState(false);

  const { data: vendorSettings = {
    id: 1,
    name: 'Mazhandu Family Bus Services',
    email: 'info@mazhandufamily.com',
    phone: '+260 97 1234567',
    address: 'Intercity Bus Terminal, Lusaka, Zambia',
    logo: '',
    theme: 'light',
    notifications: {
      email: true,
      sms: true,
      push: true,
    },
  }, isLoading: vendorSettingsLoading } = useQuery<VendorSettings>({
    queryKey: ['vendor-settings'],
    queryFn: () => vendor.getSettings(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<VendorSettings>) => vendor.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-settings'] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      // Here you would typically upload the file to your server
      // For now, we'll simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateSettingsMutation.mutate({
        ...vendorSettings,
        logo: logoPreview,
      });
      
      setLogoFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (vendorSettingsLoading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <h1 className="text-3xl font-bold gradient-text flex items-center gap-2 mb-8">
        <Building className="h-7 w-7 text-indigo-500" /> Settings
      </h1>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white/80 shadow-md rounded-lg mb-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building className="h-5 w-5 text-indigo-500" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-500" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-indigo-500" /> Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="glass shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Building className="h-5 w-5 text-indigo-400" /> Company Profile
              </CardTitle>
              <CardDescription>
                Update your company information and logo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 bg-white/80 border-2 border-indigo-200 shadow">
                      <AvatarImage src={logoPreview || vendorSettings.logo} alt={vendorSettings.name} />
                      <AvatarFallback>
                        <Image className="h-10 w-10 text-indigo-300" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="w-full bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400"
                      />
                      {logoFile && (
                        <Button
                          onClick={handleLogoUpload}
                          disabled={isUploading}
                          className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg hover:from-indigo-600 hover:to-blue-600"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Logo
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={vendorSettings.name}
                    onChange={(e) => updateSettingsMutation.mutate({
                      ...vendorSettings,
                      name: e.target.value,
                    })}
                    className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={vendorSettings.email}
                    onChange={(e) => updateSettingsMutation.mutate({
                      ...vendorSettings,
                      email: e.target.value,
                    })}
                    className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={vendorSettings.phone}
                    onChange={(e) => updateSettingsMutation.mutate({
                      ...vendorSettings,
                      phone: e.target.value,
                    })}
                    className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={vendorSettings.address}
                    onChange={(e) => updateSettingsMutation.mutate({
                      ...vendorSettings,
                      address: e.target.value,
                    })}
                    className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="glass shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Bell className="h-5 w-5 text-indigo-400" /> Notifications
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={vendorSettings.notifications.email}
                    onCheckedChange={(checked) => updateSettingsMutation.mutate({
                      ...vendorSettings,
                      notifications: {
                        ...vendorSettings.notifications,
                        email: checked,
                      },
                    })}
                  />
                  <Label>Email Notifications</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={vendorSettings.notifications.sms}
                    onCheckedChange={(checked) => updateSettingsMutation.mutate({
                      ...vendorSettings,
                      notifications: {
                        ...vendorSettings.notifications,
                        sms: checked,
                      },
                    })}
                  />
                  <Label>SMS Notifications</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={vendorSettings.notifications.push}
                    onCheckedChange={(checked) => updateSettingsMutation.mutate({
                      ...vendorSettings,
                      notifications: {
                        ...vendorSettings.notifications,
                        push: checked,
                      },
                    })}
                  />
                  <Label>Push Notifications</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="glass shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Paintbrush className="h-5 w-5 text-indigo-400" /> Appearance
              </CardTitle>
              <CardDescription>
                Choose your preferred theme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={vendorSettings.theme}
                  onValueChange={(value) => updateSettingsMutation.mutate({
                    ...vendorSettings,
                    theme: value as VendorSettings['theme'],
                  })}
                >
                  <SelectTrigger className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 