import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import type { Vendor } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { VendorUserForm } from "./vendor-user-form";
import { VendorUserList } from "./vendor-user-list";
import { UserPermissionOverrides } from "./user-permission-overrides";
import { ROLE_TEMPLATES, getRoleTemplate } from "@/types/permissions";

// Create a schema for vendor form validation
const vendorFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  address: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]),
  logo: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

interface VendorFormProps {
  vendor?: Vendor | null;
  onSuccess?: (vendor: Vendor) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export function VendorForm({ vendor, onSuccess, onCancel, onClose }: VendorFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("vendor-info");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [vendorRole, setVendorRole] = useState("operator");
  const [vendorPermissions, setVendorPermissions] = useState<string[]>([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const isEditing = !!vendor;

  const defaultValues: Partial<VendorFormValues> = {
    name: vendor?.name || "",
    email: vendor?.email || "",
    phone: vendor?.phone || "",
    address: vendor?.address || "",
    status: vendor?.status || "active",
    logo: vendor?.logo || "",
  };

  // Initialize vendor permissions from existing vendor data
  useEffect(() => {
    if (vendor?.permissions && vendor.permissions.length > 0) {
      setVendorPermissions(vendor.permissions);
      // Try to determine the role based on permissions
      const roleTemplate = ROLE_TEMPLATES.find(template => 
        template.permissions.length === vendor.permissions!.length &&
        template.permissions.every(p => vendor.permissions!.includes(p))
      );
      if (roleTemplate) {
        setVendorRole(roleTemplate.id);
      } else {
        setVendorRole("custom");
      }
    }
  }, [vendor]);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues,
  });

  async function saveVendorPermissions() {
    if (!isEditing || !vendor) {
      toast({
        title: "Error",
        description: "Cannot save permissions for a new vendor. Please save the vendor first.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingPermissions(true);
    try {
      await apiRequest("PATCH", `/api/vendors/${vendor.id}`, {
        permissions: vendorPermissions,
      });
      
      toast({
        title: "Permissions saved",
        description: "Vendor permissions have been updated successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save vendor permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPermissions(false);
    }
  }

  async function onSubmit(data: VendorFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...data,
        permissions: vendorPermissions,
      };

      if (isEditing) {
        await apiRequest("PATCH", `/api/vendors/${vendor.id}`, payload);
        toast({
          title: "Vendor updated",
          description: "The vendor has been successfully updated.",
        });
      } else {
        await apiRequest("POST", "/api/vendors", payload);
        toast({
          title: "Vendor created",
          description: "The vendor has been successfully created.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });

      if (onSuccess) {
        onSuccess(payload as unknown as Vendor);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save vendor");
      toast({
        title: "Error",
        description: "Failed to save vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? "Edit Vendor" : "Add New Vendor"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing
              ? "Update the vendor information and manage users"
              : "Fill in the details below to add a new vendor"}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vendor-info">Vendor Information</TabsTrigger>
            <TabsTrigger value="user-management" disabled={!isEditing}>
              User Management
            </TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="permission-overrides" disabled={!isEditing}>
              Permission Overrides
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vendor-info">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mazhandu Bus Services" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@mazhandu.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+260 211 123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Plot 123, Great East Road, Lusaka" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      : (isEditing ? "Update Vendor" : "Create Vendor")
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="user-management">
            {isAddingUser ? (
              <VendorUserForm
                vendor={vendor}
                onClose={() => setIsAddingUser(false)}
                onSuccess={() => {
                  setIsAddingUser(false);
                  toast({
                    title: "User created",
                    description: "Vendor user has been successfully created.",
                  });
                }}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Vendor Users</h3>
                    <p className="text-sm text-gray-500">
                      Manage users who can access this vendor's system
                    </p>
                  </div>
                  <Button onClick={() => setIsAddingUser(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
                
                <VendorUserList
                  vendorId={vendor?.id || 0}
                  onEdit={(user) => {
                    // Handle edit user
                    console.log("Edit user:", user);
                  }}
                  onDelete={(userId) => {
                    // Handle delete user
                    console.log("Delete user:", userId);
                  }}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="permissions">
            <div className="max-w-xl mx-auto">
              <h3 className="text-lg font-medium mb-4">Vendor Default Role & Permissions</h3>
              <RoleSelector
                selectedRole={vendorRole}
                selectedPermissions={vendorPermissions}
                onRoleChange={setVendorRole}
                onPermissionsChange={setVendorPermissions}
              />
              <div className="mt-4 text-gray-500 text-sm">
                These permissions will apply to all vendor users by default unless overridden per user.
              </div>
              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={saveVendorPermissions}
                    disabled={isSavingPermissions}
                  >
                    {isSavingPermissions ? "Saving..." : "Save Permissions"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="permission-overrides">
            {isEditing && vendor ? (
              <UserPermissionOverrides 
                userId={vendor.id.toString()} 
                userName={vendor.name}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Permission overrides are only available when editing an existing vendor.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}