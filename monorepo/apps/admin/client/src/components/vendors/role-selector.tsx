import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown, 
  ChevronRight, 
  Shield, 
  Users, 
  Settings, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus
} from "lucide-react";
import { 
  PERMISSIONS, 
  ROLE_TEMPLATES, 
  getPermissionsByCategory, 
  getRoleTemplate,
  type Permission,
  type RoleTemplate 
} from "@/types/permissions";

interface RoleSelectorProps {
  selectedRole: string;
  selectedPermissions: string[];
  onRoleChange: (role: string) => void;
  onPermissionsChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export function RoleSelector({ 
  selectedRole, 
  selectedPermissions, 
  onRoleChange, 
  onPermissionsChange,
  disabled = false 
}: RoleSelectorProps) {
  const [activeTab, setActiveTab] = useState("templates");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [customRoleName, setCustomRoleName] = useState("");
  const [isCustomRole, setIsCustomRole] = useState(false);

  const categories = getPermissionsByCategory();

  useEffect(() => {
    // Set initial permissions based on selected role
    if (selectedRole && !isCustomRole) {
      const template = getRoleTemplate(selectedRole);
      if (template) {
        onPermissionsChange(template.permissions);
      }
    }
  }, [selectedRole, isCustomRole]);

  const handleRoleTemplateSelect = (roleId: string) => {
    setIsCustomRole(false);
    onRoleChange(roleId);
    const template = getRoleTemplate(roleId);
    if (template) {
      onPermissionsChange(template.permissions);
    }
  };

  const handleCustomRoleToggle = () => {
    setIsCustomRole(!isCustomRole);
    if (!isCustomRole) {
      onRoleChange("custom");
      setCustomRoleName("");
    } else {
      onRoleChange("operator"); // Default to operator
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handlePermissionToggle = (permissionId: string) => {
    const newPermissions = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter(p => p !== permissionId)
      : [...selectedPermissions, permissionId];
    
    onPermissionsChange(newPermissions);
  };

  const handleCategoryToggle = (category: string, grant: boolean) => {
    const categoryPermissions = categories[category].map(p => p.id);
    const newPermissions = grant
      ? Array.from(new Set([...selectedPermissions, ...categoryPermissions]))
      : selectedPermissions.filter(p => !categoryPermissions.includes(p));
    
    onPermissionsChange(newPermissions);
  };

  const getPermissionIcon = (permission: Permission) => {
    const iconMap: Record<string, React.ReactNode> = {
      view: <Eye className="h-4 w-4" />,
      create: <Plus className="h-4 w-4" />,
      edit: <Edit className="h-4 w-4" />,
      delete: <Trash2 className="h-4 w-4" />,
      manage: <Settings className="h-4 w-4" />
    };
    return iconMap[permission.group] || <Shield className="h-4 w-4" />;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Dashboard: <Shield className="h-4 w-4" />,
      Routes: <Settings className="h-4 w-4" />,
      Tickets: <Users className="h-4 w-4" />,
      Buses: <Settings className="h-4 w-4" />,
      Schedule: <Settings className="h-4 w-4" />,
      History: <Eye className="h-4 w-4" />,
      Reports: <Eye className="h-4 w-4" />,
      Settings: <Settings className="h-4 w-4" />,
      Users: <Users className="h-4 w-4" />,
      Profile: <Users className="h-4 w-4" />,
      Support: <Shield className="h-4 w-4" />
    };
    return iconMap[category] || <Shield className="h-4 w-4" />;
  };

  const isCategoryFullySelected = (category: string) => {
    const categoryPermissions = categories[category].map(p => p.id);
    return categoryPermissions.every(p => selectedPermissions.includes(p));
  };

  const isCategoryPartiallySelected = (category: string) => {
    const categoryPermissions = categories[category].map(p => p.id);
    const selectedCount = categoryPermissions.filter(p => selectedPermissions.includes(p)).length;
    return selectedCount > 0 && selectedCount < categoryPermissions.length;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role & Permissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Role Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4">
              {ROLE_TEMPLATES.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRole === template.id && !isCustomRole 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : ''
                  }`}
                  onClick={() => !disabled && handleRoleTemplateSelect(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={template.color}>
                            {template.name}
                          </Badge>
                          {selectedRole === template.id && !isCustomRole && (
                            <Badge variant="secondary">Selected</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {template.permissions.slice(0, 5).map(permissionId => {
                            const permission = PERMISSIONS.find(p => p.id === permissionId);
                            return permission ? (
                              <Badge key={permissionId} variant="outline" className="text-xs">
                                {permission.name}
                              </Badge>
                            ) : null;
                          })}
                          {template.permissions.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.permissions.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={handleCustomRoleToggle}
                  disabled={disabled}
                  className="w-full"
                >
                  {isCustomRole ? "Use Template" : "Create Custom Role"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              {Object.entries(categories).map(([category, permissions]) => (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                        {expandedCategories.includes(category) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        {getCategoryIcon(category)}
                        <span className="font-medium">{category}</span>
                        <Badge variant="outline" className="text-xs">
                          {permissions.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCategoryToggle(category, true)}
                          disabled={disabled}
                        >
                          Select All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCategoryToggle(category, false)}
                          disabled={disabled}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedCategories.includes(category) && (
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {permissions.map((permission) => (
                          <div 
                            key={permission.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                disabled={disabled}
                              />
                              <div className="flex items-center gap-2">
                                {getPermissionIcon(permission)}
                                <div>
                                  <p className="font-medium text-sm">{permission.name}</p>
                                  <p className="text-xs text-gray-500">{permission.description}</p>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {permission.group}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="space-y-2">
          <h4 className="font-medium">Selected Permissions ({selectedPermissions.length})</h4>
          <div className="flex flex-wrap gap-1">
            {selectedPermissions.slice(0, 10).map(permissionId => {
              const permission = PERMISSIONS.find(p => p.id === permissionId);
              return permission ? (
                <Badge key={permissionId} variant="secondary" className="text-xs">
                  {permission.name}
                </Badge>
              ) : null;
            })}
            {selectedPermissions.length > 10 && (
              <Badge variant="secondary" className="text-xs">
                +{selectedPermissions.length - 10} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 