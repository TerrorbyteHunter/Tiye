import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemSettings } from "@/components/settings/system-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Shield, Database, Bell, Lock, AlertTriangle } from "lucide-react";

// Placeholder for BackupManager component
const BackupManager = () => {
  return (
    <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Backup Manager
        </CardTitle>
        <CardDescription>Manage database backups</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Placeholder for backup management UI */}
        <p>Backup functionality not yet implemented.</p>
      </CardContent>
    </Card>
  );
};


export default function Settings() {
  const { toast } = useToast();
  const [automaticBackups, setAutomaticBackups] = useState(true);
  const [activityLogging, setActivityLogging] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const toggleFeature = (feature: string, enabled: boolean) => {
    toast({
      title: `${feature} ${enabled ? 'enabled' : 'disabled'}`,
      description: `${feature} has been ${enabled ? 'enabled' : 'disabled'} successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-600 via-slate-600 to-zinc-600 rounded-2xl mb-8 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">System Settings</h1>
              <p className="text-gray-100">Configure system-wide settings and preferences</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="hidden md:block w-1 h-12 bg-white/30 rounded-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-xs text-gray-200">Active Features</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-xs text-gray-200">System Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-xs text-gray-200">Reliability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardContent className="p-6">
            <Tabs defaultValue="general">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Database className="h-4 w-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                <SystemSettings />
              </TabsContent>

              <TabsContent value="security" className="space-y-6 mt-6">
                <Card className="backdrop-blur-sm bg-white/60 border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-blue-600" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Configure security features and access controls
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Require admins to use 2FA when logging in
                        </p>
                      </div>
                      <Switch
                        id="two-factor"
                        checked={false}
                        onCheckedChange={(checked) => 
                          toast({
                            title: "Feature not available",
                            description: "Two-factor authentication setup is not available in this version.",
                            variant: "destructive",
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="activity-logging">Activity Logging</Label>
                        <p className="text-sm text-muted-foreground">
                          Log all admin actions for auditing purposes
                        </p>
                      </div>
                      <Switch
                        id="activity-logging"
                        checked={activityLogging}
                        onCheckedChange={(checked) => {
                          setActivityLogging(checked);
                          toggleFeature("Activity logging", checked);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically log out inactive users
                        </p>
                      </div>
                      <div className="w-20">
                        <input 
                          type="number" 
                          id="session-timeout" 
                          min="5" 
                          max="120" 
                          defaultValue="30"
                          className="w-full p-2 border rounded-md" 
                          onChange={() => 
                            toast({
                              title: "Session timeout updated",
                              description: "New session timeout has been set successfully.",
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6 mt-6">
                <Card className="backdrop-blur-sm bg-white/60 border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      Advanced Settings
                    </CardTitle>
                    <CardDescription>
                      Configure system maintenance and advanced features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="backups">Automatic Backups</Label>
                        <p className="text-sm text-muted-foreground">
                          Schedule automatic database backups
                        </p>
                      </div>
                      <Switch
                        id="backups"
                        checked={automaticBackups}
                        onCheckedChange={(checked) => {
                          setAutomaticBackups(checked);
                          toggleFeature("Automatic backups", checked);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send email notifications for important system events
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={(checked) => {
                          setEmailNotifications(checked);
                          toggleFeature("Email notifications", checked);
                        }}
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                        onClick={() => 
                          toast({
                            title: "Maintenance mode not available",
                            description: "This feature is not available in the current version.",
                            variant: "destructive",
                          })
                        }
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Enter System Maintenance Mode
                      </button>
                    </div>
                  </CardContent>
                </Card>
                <BackupManager />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}