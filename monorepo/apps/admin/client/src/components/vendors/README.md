# Vendor User Management with Role-Based Permissions

This module provides a comprehensive role selector interface for vendor user creation with granular permissions control.

## Features

### 🎯 Role Templates
- **Owner**: Full access to all features and user management
- **Manager**: Can manage operations but limited user management
- **Operator**: Can handle daily operations and ticket management
- **Viewer**: Read-only access to view information

### 🔐 Granular Permissions
The system includes 30+ granular permissions across 10 categories:

#### Dashboard
- View Dashboard

#### Routes
- View Routes
- Create Routes
- Edit Routes
- Delete Routes

#### Tickets
- View Tickets
- Create Tickets
- Edit Tickets
- Delete Tickets
- Process Refunds

#### Buses
- View Buses
- Add Buses
- Edit Buses
- Remove Buses

#### Schedule
- View Schedule
- Create Schedule
- Edit Schedule
- Delete Schedule

#### History
- View History

#### Reports
- View Reports
- Export Reports

#### Settings
- View Settings
- Edit Settings

#### Users
- View Users
- Create Users
- Edit Users
- Delete Users

#### Profile
- View Profile
- Edit Profile

#### Support
- Access Support

## Components

### RoleSelector
A comprehensive component that provides:
- **Role Templates Tab**: Choose from predefined roles
- **Custom Permissions Tab**: Granular permission selection
- **Category-based Organization**: Permissions grouped by functionality
- **Visual Feedback**: Clear indication of selected permissions
- **Bulk Operations**: Select/deselect entire categories

### VendorUserForm
A form component for creating/editing vendor users with:
- Basic user information (name, email, username, password)
- Role selection with permission preview
- Account status management
- Integration with the role selector

### VendorUserList
A table component displaying vendor users with:
- User information and role badges
- Account status indicators
- Last login tracking
- Edit/delete actions

### VendorForm (Enhanced)
Updated vendor form with:
- **Vendor Information Tab**: Basic vendor details
- **User Management Tab**: Manage vendor users (when editing)

## Usage

### Basic Role Selection
```tsx
import { RoleSelector } from './role-selector';

function MyComponent() {
  const [selectedRole, setSelectedRole] = useState('operator');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  return (
    <RoleSelector
      selectedRole={selectedRole}
      selectedPermissions={selectedPermissions}
      onRoleChange={setSelectedRole}
      onPermissionsChange={setSelectedPermissions}
    />
  );
}
```

### Creating a Vendor User
```tsx
import { VendorUserForm } from './vendor-user-form';

function CreateUser() {
  return (
    <VendorUserForm
      vendor={vendor}
      onSuccess={(user) => console.log('User created:', user)}
      onClose={() => setShowForm(false)}
    />
  );
}
```

### Managing Vendor Users
```tsx
import { VendorUserList } from './vendor-user-list';

function ManageUsers() {
  return (
    <VendorUserList
      vendorId={vendor.id}
      onEdit={(user) => handleEditUser(user)}
      onDelete={(userId) => handleDeleteUser(userId)}
    />
  );
}
```

## Database Schema

The system uses three main tables:

### vendor_users
- Basic user information
- Role assignment
- Account status

### vendor_user_permissions
- Granular permission assignments
- Audit trail (granted by, granted at)

### vendors
- Vendor organization information

## API Endpoints

- `GET /api/vendor-users` - List vendor users
- `POST /api/vendor-users` - Create vendor user
- `PATCH /api/vendor-users/:id` - Update vendor user
- `DELETE /api/vendor-users/:id` - Delete vendor user

## Benefits

1. **Intuitive Interface**: Visual role templates with clear descriptions
2. **Flexible Permissions**: Granular control over user access
3. **Scalable Design**: Easy to add new permissions and roles
4. **Audit Trail**: Track permission changes and assignments
5. **Security**: Role-based access control for vendor operations

## Future Enhancements

- Permission inheritance (child roles)
- Time-based permissions
- Permission groups and templates
- Advanced audit logging
- Bulk user operations 