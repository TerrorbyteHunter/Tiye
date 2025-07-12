import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Edit, 
  Trash2, 
  User, 
  Shield, 
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoleTemplate } from "@/types/permissions";
import type { VendorUser } from "@shared/schema";

interface VendorUserListProps {
  vendorId: number;
  onEdit: (user: VendorUser) => void;
  onDelete: (userId: number) => void;
}

export function VendorUserList({ vendorId, onEdit, onDelete }: VendorUserListProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { data: users, isLoading: isLoadingUsers, error } = useQuery({
    queryKey: ['/api/vendor-users', vendorId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vendor-users?vendorId=${vendorId}`);
      return response as unknown as VendorUser[];
    },
  });

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("DELETE", `/api/vendor-users/${userId}`);
      toast({
        title: "User deleted",
        description: "The vendor user has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const template = getRoleTemplate(role);
    if (!template) return <Badge variant="outline">{role}</Badge>;
    
    return (
      <Badge className={template.color}>
        {template.name}
      </Badge>
    );
  };

  const getStatusIcon = (active: boolean) => {
    return active ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  // Defensive: ensure users is always an array
  const userList = Array.isArray(users) ? users : [];

  if (isLoadingUsers) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error loading users. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userList || userList.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users found</p>
            <p className="text-sm">Add users to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Vendor Users ({userList.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">@{user.username}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(user.active)}
                    <span className={user.active ? "text-green-600" : "text-red-600"}>
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {user.lastLogin ? (
                    <div className="text-sm text-gray-500">
                      {new Date(user.lastLogin).toLocaleDateString()}
                      <br />
                      <span className="text-xs">
                        {new Date(user.lastLogin).toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 