import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ROLE_TEMPLATES, PERMISSIONS, getRoleTemplate, RoleTemplate } from "@/types/permissions";
import { RoleSelector } from "./role-selector";
import { Plus, Trash2, Edit, Loader2, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Role } from "@shared/schema";

type CombinedRole = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  color: string;
  isSystem: boolean;
  dbId?: number;
};

export function RoleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("bg-blue-500");
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch roles from API
  const { data: roles = [], isLoading, error } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
    queryFn: () => apiRequest("GET", "/api/roles").then(res => res.json()),
  });

  // Combine system roles with custom roles
  const allRoles: CombinedRole[] = [
    ...ROLE_TEMPLATES.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      permissions: template.permissions,
      color: template.color,
      isSystem: true,
    })),
    ...roles.map(role => ({
      id: `custom_${role.id}`,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      color: role.color,
      isSystem: false,
      dbId: role.id,
    }))
  ];

  const selectedRole = allRoles.find(r => r.id === selectedRoleId) || null;

  // Filter roles based on search term
  const filteredRoles = allRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (roleData: { name: string; description: string; permissions: string[]; color: string }) =>
      apiRequest("POST", "/api/roles", roleData).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({
        title: "Role created",
        description: "The role has been successfully created.",
      });
      setIsCreating(false);
      setNewRoleName("");
      setNewRoleDescription("");
      setNewRolePermissions([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Role> }) =>
      apiRequest("PUT", `/api/roles/${id}`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({
        title: "Role updated",
        description: "The role has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/roles/${id}`),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({
        title: "Role deleted",
        description: "The role has been successfully deleted.",
      });
      if (selectedRoleId?.startsWith(`custom_${deletedId}`)) {
        setSelectedRoleId(allRoles[0]?.id || null);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete role. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (allRoles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(allRoles[0].id);
    }
  }, [allRoles, selectedRoleId]);

  const handleCreateRole = () => {
    if (!newRoleName.trim()) return;
    
    createRoleMutation.mutate({
      name: newRoleName,
      description: newRoleDescription || "Custom role",
      permissions: newRolePermissions,
      color: newRoleColor,
    });
  };

  const handleDeleteRole = (role: CombinedRole) => {
    if (role.isSystem) {
      toast({
        title: "Cannot delete",
        description: "System roles cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    
    if (role.dbId) {
      deleteRoleMutation.mutate(role.dbId);
    }
  };

  const handleUpdateRole = (updated: CombinedRole) => {
    if (updated.isSystem) {
      toast({
        title: "Cannot edit",
        description: "System roles cannot be edited.",
        variant: "destructive",
      });
      return;
    }
    
    if (updated.dbId) {
      updateRoleMutation.mutate({
        id: updated.dbId,
        data: {
          name: updated.name,
          description: updated.description,
          permissions: updated.permissions,
          color: updated.color,
        },
      });
    }
  };

  const handlePermissionChange = (perms: string[]) => {
    if (selectedRole && selectedRole.isSystem) {
      // Don't show error for system roles when just viewing/changing permissions
      return;
    }
    
    if (selectedRole && !selectedRole.isSystem && selectedRole.dbId) {
      handleUpdateRole({ ...selectedRole, permissions: perms });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading roles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load roles</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold">{allRoles.length}</p>
              </div>
              <Badge variant="outline">{allRoles.filter(r => r.isSystem).length} System</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custom Roles</p>
                <p className="text-2xl font-bold">{allRoles.filter(r => !r.isSystem).length}</p>
              </div>
              <Badge variant="outline">{allRoles.filter(r => !r.isSystem).length} Custom</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                <p className="text-2xl font-bold">{PERMISSIONS.length}</p>
              </div>
              <Badge variant="outline">Available</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected Role</p>
                <p className="text-2xl font-bold">{selectedRole?.name || 'None'}</p>
              </div>
              {selectedRole && (
                <Badge className={selectedRole.color}>{selectedRole.permissions.length} perms</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Role List */}
        <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Role Templates</h3>
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Role
          </Button>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          {filteredRoles.length > 0 ? (
            filteredRoles.map(role => (
              <Card
                key={role.id}
                className={`flex items-center justify-between cursor-pointer transition-all ${selectedRoleId === role.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                onClick={() => setSelectedRoleId(role.id)}
              >
                <CardContent className="flex items-center gap-2 p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={role.color}>{role.name}</Badge>
                      {role.isSystem && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                          System
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{role.description}</span>
                  </div>
                </CardContent>
                <div className="flex items-center gap-2 pr-3">
                  {!role.isSystem && role.dbId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={e => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Role</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRole(role)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Role
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </Card>
            ))
          ) : searchTerm ? (
            <div className="text-center py-8 text-gray-500">
              <p>No roles match your search</p>
              <p className="text-sm">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No roles found</p>
              <p className="text-sm">Click "New Role" to create your first custom role</p>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Role Details / Edit */}
      <div className="md:col-span-2">
        {isCreating ? (
          <Card>
            <CardHeader>
              <CardTitle>Create New Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Role Name</label>
                  <Input
                    placeholder="Role name (e.g. Supervisor)"
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Role description (optional)"
                    value={newRoleDescription}
                    onChange={e => setNewRoleDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex gap-2 mt-1">
                    {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-gray-500'].map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-6 h-6 rounded-full ${color} ${newRoleColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                        onClick={() => setNewRoleColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <RoleSelector
                selectedRole={"custom"}
                selectedPermissions={newRolePermissions}
                onRoleChange={() => {}}
                onPermissionsChange={setNewRolePermissions}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreateRole} 
                  disabled={!newRoleName.trim() || createRoleMutation.isPending}
                >
                  {createRoleMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : selectedRole ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Role: {selectedRole.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Role Name</label>
                  <Input
                    value={selectedRole.name}
                    onChange={e => {
                      if (!selectedRole.isSystem && selectedRole.dbId) {
                        handleUpdateRole({ ...selectedRole, name: e.target.value });
                      }
                    }}
                    disabled={selectedRole.isSystem}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={selectedRole.description || ""}
                    onChange={e => {
                      if (!selectedRole.isSystem && selectedRole.dbId) {
                        handleUpdateRole({ ...selectedRole, description: e.target.value });
                      }
                    }}
                    disabled={selectedRole.isSystem}
                  />
                </div>
              </div>
              <RoleSelector
                selectedRole={selectedRole.id}
                selectedPermissions={selectedRole.permissions}
                onRoleChange={() => {}}
                onPermissionsChange={handlePermissionChange}
                disabled={selectedRole.isSystem}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="text-gray-400 text-center py-12">Select a role to view or edit</div>
        )}
      </div>
    </div>
  );
} 