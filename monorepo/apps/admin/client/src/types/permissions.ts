export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  group: string;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

export const PERMISSIONS: Permission[] = [
  // Dashboard
  {
    id: 'dashboard_view',
    name: 'View Dashboard',
    description: 'Access to view dashboard overview and statistics',
    category: 'Dashboard',
    group: 'view'
  },

  // Routes
  {
    id: 'routes_view',
    name: 'View Routes',
    description: 'View all routes and route details',
    category: 'Routes',
    group: 'view'
  },
  {
    id: 'routes_create',
    name: 'Create Routes',
    description: 'Create new routes',
    category: 'Routes',
    group: 'manage'
  },
  {
    id: 'routes_edit',
    name: 'Edit Routes',
    description: 'Modify existing routes',
    category: 'Routes',
    group: 'manage'
  },
  {
    id: 'routes_delete',
    name: 'Delete Routes',
    description: 'Delete routes from the system',
    category: 'Routes',
    group: 'manage'
  },

  // Tickets
  {
    id: 'tickets_view',
    name: 'View Tickets',
    description: 'View all tickets and booking details',
    category: 'Tickets',
    group: 'view'
  },
  {
    id: 'tickets_create',
    name: 'Create Tickets',
    description: 'Create new tickets and bookings',
    category: 'Tickets',
    group: 'manage'
  },
  {
    id: 'tickets_edit',
    name: 'Edit Tickets',
    description: 'Modify existing tickets',
    category: 'Tickets',
    group: 'manage'
  },
  {
    id: 'tickets_delete',
    name: 'Delete Tickets',
    description: 'Delete tickets from the system',
    category: 'Tickets',
    group: 'manage'
  },
  {
    id: 'tickets_refund',
    name: 'Process Refunds',
    description: 'Process ticket refunds and cancellations',
    category: 'Tickets',
    group: 'manage'
  },

  // Buses
  {
    id: 'buses_view',
    name: 'View Buses',
    description: 'View bus fleet and vehicle details',
    category: 'Buses',
    group: 'view'
  },
  {
    id: 'buses_create',
    name: 'Add Buses',
    description: 'Add new buses to the fleet',
    category: 'Buses',
    group: 'manage'
  },
  {
    id: 'buses_edit',
    name: 'Edit Buses',
    description: 'Modify bus information',
    category: 'Buses',
    group: 'manage'
  },
  {
    id: 'buses_delete',
    name: 'Remove Buses',
    description: 'Remove buses from the fleet',
    category: 'Buses',
    group: 'manage'
  },

  // Schedule
  {
    id: 'schedule_view',
    name: 'View Schedule',
    description: 'View trip schedules and timetables',
    category: 'Schedule',
    group: 'view'
  },
  {
    id: 'schedule_create',
    name: 'Create Schedule',
    description: 'Create new trip schedules',
    category: 'Schedule',
    group: 'manage'
  },
  {
    id: 'schedule_edit',
    name: 'Edit Schedule',
    description: 'Modify existing schedules',
    category: 'Schedule',
    group: 'manage'
  },
  {
    id: 'schedule_delete',
    name: 'Delete Schedule',
    description: 'Remove schedules from the system',
    category: 'Schedule',
    group: 'manage'
  },

  // History
  {
    id: 'history_view',
    name: 'View History',
    description: 'Access to trip history and past records',
    category: 'History',
    group: 'view'
  },

  // Reports
  {
    id: 'reports_view',
    name: 'View Reports',
    description: 'Access to view reports and analytics',
    category: 'Reports',
    group: 'view'
  },
  {
    id: 'reports_export',
    name: 'Export Reports',
    description: 'Export reports to various formats',
    category: 'Reports',
    group: 'manage'
  },

  // Settings
  {
    id: 'settings_view',
    name: 'View Settings',
    description: 'View system settings and configurations',
    category: 'Settings',
    group: 'view'
  },
  {
    id: 'settings_edit',
    name: 'Edit Settings',
    description: 'Modify system settings',
    category: 'Settings',
    group: 'manage'
  },

  // Admins
  {
    id: 'admins_view',
    name: 'View Admins',
    description: 'View vendor user accounts',
    category: 'Admins',
    group: 'view'
  },
  {
    id: 'admins_create',
    name: 'Create Admins',
    description: 'Create new vendor user accounts',
    category: 'Admins',
    group: 'manage'
  },
  {
    id: 'admins_edit',
    name: 'Edit Admins',
    description: 'Modify user account details',
    category: 'Admins',
    group: 'manage'
  },
  {
    id: 'admins_delete',
    name: 'Delete Admins',
    description: 'Remove user accounts',
    category: 'Admins',
    group: 'manage'
  },

  // Profile
  {
    id: 'profile_view',
    name: 'View Profile',
    description: 'View own profile information',
    category: 'Profile',
    group: 'view'
  },
  {
    id: 'profile_edit',
    name: 'Edit Profile',
    description: 'Modify own profile information',
    category: 'Profile',
    group: 'manage'
  },

  // Support
  {
    id: 'support_access',
    name: 'Access Support',
    description: 'Access to support and help resources',
    category: 'Support',
    group: 'view'
  }
];

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all features and user management',
    color: 'bg-purple-100 text-purple-800',
    permissions: PERMISSIONS.map(p => p.id)
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Can manage operations but limited user management',
    color: 'bg-blue-100 text-blue-800',
    permissions: [
      'dashboard_view',
      'routes_view', 'routes_create', 'routes_edit', 'routes_delete',
      'tickets_view', 'tickets_create', 'tickets_edit', 'tickets_delete', 'tickets_refund',
      'buses_view', 'buses_create', 'buses_edit', 'buses_delete',
      'schedule_view', 'schedule_create', 'schedule_edit', 'schedule_delete',
      'history_view',
      'reports_view', 'reports_export',
      'settings_view', 'settings_edit',
      'admins_view', 'admins_create', 'admins_edit', 'admins_delete',
      'profile_view', 'profile_edit',
      'support_access'
    ]
  },
  {
    id: 'operator',
    name: 'Operator',
    description: 'Can handle daily operations and ticket management',
    color: 'bg-green-100 text-green-800',
    permissions: [
      'dashboard_view',
      'routes_view',
      'tickets_view', 'tickets_create', 'tickets_edit', 'tickets_refund',
      'buses_view',
      'schedule_view',
      'history_view',
      'reports_view',
      'settings_view',
      'profile_view', 'profile_edit',
      'support_access'
    ]
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to view information',
    color: 'bg-gray-100 text-gray-800',
    permissions: [
      'dashboard_view',
      'routes_view',
      'tickets_view',
      'buses_view',
      'schedule_view',
      'history_view',
      'reports_view',
      'settings_view',
      'profile_view',
      'support_access'
    ]
  }
];

export const getPermissionsByCategory = () => {
  const categories: Record<string, Permission[]> = {};
  PERMISSIONS.forEach(permission => {
    if (!categories[permission.category]) {
      categories[permission.category] = [];
    }
    categories[permission.category].push(permission);
  });
  return categories;
};

export const getRoleTemplate = (roleId: string): RoleTemplate | undefined => {
  return ROLE_TEMPLATES.find(template => template.id === roleId);
}; 