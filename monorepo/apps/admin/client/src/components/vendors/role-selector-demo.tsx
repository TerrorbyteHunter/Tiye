import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleSelector } from "./role-selector";
import { PERMISSIONS, ROLE_TEMPLATES } from "@/types/permissions";

export function RoleSelectorDemo() {
  const [selectedRole, setSelectedRole] = useState("operator");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    const template = ROLE_TEMPLATES.find(t => t.id === role);
    if (template) {
      setSelectedPermissions(template.permissions);
    }
  };

  const handlePermissionsChange = (permissions: string[]) => {
    setSelectedPermissions(permissions);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Selector Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This demo shows the intuitive role selector interface for vendor user creation. 
            You can choose from predefined role templates or create custom permissions.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RoleSelector
              selectedRole={selectedRole}
              selectedPermissions={selectedPermissions}
              onRoleChange={handleRoleChange}
              onPermissionsChange={handlePermissionsChange}
            />
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Role:</span>
                      <Badge variant="outline">{selectedRole}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Permissions:</span>
                      <Badge variant="secondary">{selectedPermissions.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Role Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ROLE_TEMPLATES.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500">{template.description}</div>
                        </div>
                        <Badge className={template.color}>
                          {template.permissions.length} permissions
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Permission Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from(new Set(PERMISSIONS.map(p => p.category))).map((category) => (
                      <div key={category} className="text-sm">
                        <span className="font-medium">{category}</span>
                        <div className="text-gray-500">
                          {PERMISSIONS.filter(p => p.category === category).length} permissions
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 