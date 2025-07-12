import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SaveIcon, Loader2, Database, Shield, Bell, Mail, Phone, Globe, Settings as SettingsIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BackupManager } from "./backup-manager";

interface SettingsFormProps {
  title: string;
  description: string;
  settings: {
    [key: string]: {
      name: string;
      label: string;
      value: string;
      description?: string;
      type?: "text" | "textarea" | "email" | "phone" | "select" | "switch" | "number";
      options?: { value: string; label: string }[];
    };
  };
}

export function SettingsForm({ title, description, settings }: SettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const [formValues, setFormValues] = useState(settings);
  const [justSaved, setJustSaved] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState<{[key: string]: boolean}>({});
  
  // Update formValues when settings prop changes, but preserve user changes
  useEffect(() => {
    if (!justSaved) {
      const newFormValues = { ...settings };
      // Preserve any user changes that haven't been saved yet
      Object.keys(hasChanges).forEach(key => {
        if (hasChanges[key] && formValues[key]) {
          newFormValues[key] = formValues[key];
        }
      });
      setFormValues(newFormValues);
    }
  }, [settings, justSaved, hasChanges, formValues]);
  
  // Reset justSaved flag when settings change (indicating a successful refetch)
  useEffect(() => {
    if (justSaved && Object.keys(settings).length > 0) {
      // Check if the saved setting is now in the settings object
      const savedSetting = Object.values(settings).find(s => s.name === justSaved);
      if (savedSetting) {
        setJustSaved(null);
        // Clear the change flag for this setting
        setHasChanges(prev => ({ ...prev, [justSaved]: false }));
      }
    }
  }, [settings, justSaved]);
  
  const handleChange = (settingName: string, value: string | boolean) => {
    setFormValues({
      ...formValues,
      [settingName]: {
        ...formValues[settingName],
        value: value.toString(),
      },
    });
    // Mark this setting as having changes
    setHasChanges(prev => ({ ...prev, [settingName]: true }));
  };
  
  const handleSave = async (settingName: string) => {
    const setting = formValues[settingName];
    if (!setting) return;
    
    setIsLoading({ ...isLoading, [settingName]: true });
    setJustSaved(settingName);
    
    try {
      const response = await apiRequest(`/api/settings/${setting.name}`, { 
        method: 'POST',
        body: JSON.stringify({ value: setting.value })
      });
      
      toast({
        title: "Setting updated",
        description: `${setting.label} has been successfully updated.`,
      });
      
      // Clear the justSaved flag after a delay to allow the query to refetch
      setTimeout(() => {
        setJustSaved(null);
        queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      }, 1000);
    } catch (error) {
      setJustSaved(null);
      console.error('Failed to update setting:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, [settingName]: false });
    }
  };
  
  const renderField = (setting: any, key: string) => {
    const { type = "text", options = [] } = setting;
    
    switch (type) {
      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={setting.value === "true"}
              onCheckedChange={(checked) => handleChange(key, checked)}
            />
            <Label className="text-sm">{setting.value === "true" ? "Enabled" : "Disabled"}</Label>
          </div>
        );
      
      case "select":
        return (
          <Select value={setting.value} onValueChange={(value) => handleChange(key, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "textarea":
        return (
          <Textarea
            value={setting.value}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={3}
          />
        );
      
      case "number":
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        );
      
      default:
        return (
          <Input
            type={type}
            value={setting.value}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        );
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(formValues).map((key) => {
          const setting = formValues[key];
          const hasUnsavedChanges = hasChanges[key];
          
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">{setting.label}</h3>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  )}
                  {hasUnsavedChanges && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ Unsaved changes
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSave(key)}
                  disabled={isLoading[key] || !hasUnsavedChanges}
                >
                  {isLoading[key] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SaveIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {renderField(setting, key)}
              
              <Separator className="my-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function SystemSettings() {
  const { data: settings = [], isLoading, error } = useQuery({
    queryKey: ['/api/settings'],
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  if (error) {
    console.error('Error loading settings:', error);
  }
  
  // Convert the settings array to a more usable format
  const systemSettings = (settings as any[]).reduce((acc: any, setting: any) => {
    if (setting.name && setting.name.startsWith('system_')) {
      acc[setting.name] = {
        name: setting.name,
        label: setting.name.replace('system_', '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        value: setting.value || '',
        description: setting.description,
      };
    }
    return acc;
  }, {});
  
  const contactSettings = (settings as any[]).reduce((acc: any, setting: any) => {
    if (setting.name && setting.name.startsWith('contact_')) {
      const type = setting.name.includes('email') 
        ? 'email' 
        : setting.name.includes('phone') 
          ? 'phone' 
          : 'text';
          
      acc[setting.name] = {
        name: setting.name,
        label: setting.name.replace('contact_', '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        value: setting.value || '',
        description: setting.description,
        type,
      };
    }
    return acc;
  }, {});
  
  const notificationSettings = (settings as any[]).reduce((acc: any, setting: any) => {
    if (setting.name && setting.name.startsWith('notification_')) {
      acc[setting.name] = {
        name: setting.name,
        label: setting.name.replace('notification_', '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        value: setting.value || '',
        description: setting.description,
        type: setting.name.includes('enabled') ? 'switch' : 'text',
      };
    }
    return acc;
  }, {});
  
  const securitySettings = (settings as any[]).reduce((acc: any, setting: any) => {
    if (setting.name && setting.name.startsWith('security_')) {
      acc[setting.name] = {
        name: setting.name,
        label: setting.name.replace('security_', '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        value: setting.value || '',
        description: setting.description,
        type: setting.name.includes('enabled') ? 'switch' : 'text',
      };
    }
    return acc;
  }, {});
  
  // Only provide defaults if no settings were found AND there was no error
  if (Object.keys(systemSettings).length === 0 && !error) {
    systemSettings.system_name = {
      name: 'system_name',
      label: 'System Name',
      value: 'Tiyende Bus Reservation',
      description: 'The name of the system as displayed to users',
    };
    systemSettings.system_timezone = {
      name: 'system_timezone',
      label: 'System Timezone',
      value: 'Africa/Lusaka',
      description: 'Default timezone for the system',
      type: 'select',
      options: [
        { value: 'Africa/Lusaka', label: 'Africa/Lusaka (GMT+2)' },
        { value: 'UTC', label: 'UTC (GMT+0)' },
        { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
      ]
    };
    systemSettings.system_language = {
      name: 'system_language',
      label: 'System Language',
      value: 'en',
      description: 'Default language for the system',
      type: 'select',
      options: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
      ]
    };
  }
  
  if (Object.keys(contactSettings).length === 0 && !error) {
    contactSettings.contact_email = {
      name: 'contact_email',
      label: 'Contact Email',
      value: 'support@tiyende.com',
      description: 'Primary support email address',
      type: 'email',
    };
    
    contactSettings.contact_phone = {
      name: 'contact_phone',
      label: 'Contact Phone',
      value: '+260 97 1234567',
      description: 'Primary support phone number',
      type: 'phone',
    };
    
    contactSettings.contact_address = {
      name: 'contact_address',
      label: 'Contact Address',
      value: 'Lusaka, Zambia',
      description: 'Physical address for the company',
      type: 'textarea',
    };
  }
  
  if (Object.keys(notificationSettings).length === 0 && !error) {
    notificationSettings.notification_email_enabled = {
      name: 'notification_email_enabled',
      label: 'Email Notifications',
      value: 'true',
      description: 'Enable email notifications for system events',
      type: 'switch',
    };
    
    notificationSettings.notification_sms_enabled = {
      name: 'notification_sms_enabled',
      label: 'SMS Notifications',
      value: 'false',
      description: 'Enable SMS notifications for system events',
      type: 'switch',
    };
    
    notificationSettings.notification_webhook_url = {
      name: 'notification_webhook_url',
      label: 'Webhook URL',
      value: '',
      description: 'Webhook URL for external notifications',
      type: 'text',
    };
  }
  
  if (Object.keys(securitySettings).length === 0 && !error) {
    securitySettings.security_session_timeout = {
      name: 'security_session_timeout',
      label: 'Session Timeout (minutes)',
      value: '30',
      description: 'Session timeout in minutes',
      type: 'number',
    };
    
    securitySettings.security_password_min_length = {
      name: 'security_password_min_length',
      label: 'Minimum Password Length',
      value: '8',
      description: 'Minimum password length for users',
      type: 'number',
    };
    
    securitySettings.security_two_factor_enabled = {
      name: 'security_two_factor_enabled',
      label: 'Two-Factor Authentication',
      value: 'false',
      description: 'Enable two-factor authentication for admin accounts',
      type: 'switch',
    };
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading settings
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>There was an error loading the settings. Your changes may not be saved properly.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="system" className="space-y-6">
          <SettingsForm
            title="System Configuration"
            description="Configure system-wide settings and preferences"
            settings={systemSettings}
          />
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-6">
          <SettingsForm
            title="Contact Information"
            description="Manage contact details for the platform"
            settings={contactSettings}
          />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <SettingsForm
            title="Notification Settings"
            description="Configure how notifications are sent"
            settings={notificationSettings}
          />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <SettingsForm
            title="Security Settings"
            description="Configure security and authentication settings"
            settings={securitySettings}
          />
        </TabsContent>
        
        <TabsContent value="backup" className="space-y-6">
          <BackupManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
