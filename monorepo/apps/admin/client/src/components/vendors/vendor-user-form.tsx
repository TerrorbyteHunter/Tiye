import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RoleSelector } from "./role-selector";
import { ROLE_TEMPLATES, getRoleTemplate } from "@/types/permissions";
import type { Vendor, VendorUser } from "@shared/schema";
import { VendorUserPermissionOverrides } from './vendor-user-permission-overrides';

// Create a schema for vendor user form validation
const vendorUserFormSchema = z.object({
  vendorId: z.number().min(1, "Vendor is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['owner', 'manager', 'operator', 'viewer', 'custom']),
  active: z.boolean().default(true),
});

type VendorUserFormValues = z.infer<typeof vendorUserFormSchema>;

interface VendorUserFormProps {
  vendor?: Vendor | null;
  vendorUser?: VendorUser | null;
  onSuccess?: (vendorUser: VendorUser) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export function VendorUserForm({ 
  vendor, 
  vendorUser, 
  onSuccess, 
  onCancel, 
  onClose 
}: VendorUserFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState(vendorUser?.role || 'operator');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const isEditing = !!vendorUser;

  const defaultValues: Partial<VendorUserFormValues> = {
    vendorId: vendor?.id || vendorUser?.vendorId || 0,
    username: vendorUser?.username || "",
    email: vendorUser?.email || "",
    fullName: vendorUser?.fullName || "",
    password: "",
    role: (vendorUser?.role as any) || 'operator',
    active: vendorUser?.active ?? true,
  };

  const form = useForm<VendorUserFormValues>({
    resolver: zodResolver(vendorUserFormSchema),
    defaultValues,
  });

  async function onSubmit(data: VendorUserFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...data,
        permissions: selectedPermissions,
      };

      if (isEditing) {
        await apiRequest("PATCH", `/api/vendor-users/${vendorUser.id}`, payload);
        toast({
          title: "Vendor user updated",
          description: "The vendor user has been successfully updated.",
        });
      } else {
        await apiRequest("POST", "/api/vendor-users", payload);
        toast({
          title: "Vendor user created",
          description: "The vendor user has been successfully created.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['/api/vendor-users'] });

      if (onSuccess) {
        onSuccess(payload as unknown as VendorUser);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save vendor user");
      toast({
        title: "Error",
        description: "Failed to save vendor user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {isEditing ? "Edit Vendor User" : "Create Vendor User"}
        </CardTitle>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          disabled={!!vendor || isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={vendor?.id?.toString() || ""}>
                              {vendor?.name || "Select vendor"}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {isEditing ? "New Password (leave blank to keep current)" : "Password"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="••••••••" 
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Account</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable or disable this user account
                        </div>
                      </div>
                      <FormControl>
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => field.onChange(value === 'true')}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Role & Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Role & Permissions</h3>
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedRole(value as "owner" | "manager" | "operator" | "viewer");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_TEMPLATES.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">Custom Role</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <RoleSelector
                  selectedRole={selectedRole}
                  selectedPermissions={selectedPermissions}
                  onRoleChange={(role) => setSelectedRole(role as "owner" | "manager" | "operator" | "viewer")}
                  onPermissionsChange={setSelectedPermissions}
                  disabled={isLoading}
                />
              </div>

              {/* Permissions Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Permission Overrides</h3>
                {vendorUser?.id && (
                  <VendorUserPermissionOverrides vendorUserId={vendorUser.id} />
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading 
                  ? (isEditing ? "Updating..." : "Creating...") 
                  : (isEditing ? "Update User" : "Create User")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 