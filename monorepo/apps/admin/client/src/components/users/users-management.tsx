import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { AdminList } from "./user-list";
import { UserForm } from "./user-form";

interface LocalAdmin {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  lastLogin?: string;
}

export function UsersManagement() {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<LocalAdmin | null>(null);

  const handleUserEdit = (admin: any) => {
    setEditingUser({
      ...admin,
      lastLogin: admin.lastLogin ? new Date(admin.lastLogin).toISOString() : undefined,
    });
    setIsAddingUser(true);
  };

  const handleUserFormClose = () => {
    setIsAddingUser(false);
    setEditingUser(null);
  };

  return (
    <>
      {isAddingUser ? (
        <UserForm 
          user={editingUser} 
          onClose={handleUserFormClose} 
        />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Admins</CardTitle>
            <Button onClick={() => setIsAddingUser(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </CardHeader>
          <CardContent>
            <AdminList onEdit={handleUserEdit} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
