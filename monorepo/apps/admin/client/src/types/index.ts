// User related types
export interface Admin {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  lastLogin?: string;
}

export interface LoginResponse {
  user: Admin;
  token: string;
}

// Dashboard related types
export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeVendors: number;
  activeRoutes: number;
  recentBookings: any[];
  recentActivities: any[];
  revenueData: { date: string; revenue: number }[];
  bookingDistribution: { name: string; value: number }[];
  revenueDistribution: { name: string; value: number }[];
  bookingsData: { date: string; bookings: number }[];
  bookingChange?: {
    type: "increase" | "decrease" | "neutral";
    value: string;
    text: string;
  };
  revenueChange?: {
    type: "increase" | "decrease" | "neutral";
    value: string;
    text: string;
  };
  vendorChange?: {
    type: "increase" | "decrease" | "neutral";
    value: string;
    text: string;
  };
  routeChange?: {
    type: "increase" | "decrease" | "neutral";
    value: string;
    text: string;
  };
}

// Chart related types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins?: {
    legend?: {
      position?: 'top' | 'left' | 'right' | 'bottom' | 'center';
      display?: boolean;
    };
    tooltip?: {
      enabled?: boolean;
    };
  };
  scales?: {
    y?: {
      beginAtZero?: boolean;
    };
  };
}

// Form state types
export interface FormState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string | null;
}

// Modal state types
export interface ModalState {
  isOpen: boolean;
  type: 'create' | 'edit' | 'delete' | 'view';
  itemId?: number;
}

// Add this interface for Vendor
export interface Vendor {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string | null;
  status: 'active' | 'inactive' | 'pending';
  logo?: string | null;
  permissions?: string[] | null;
  createdAt?: string;
  last_login?: string | null;
  ip_address?: string | null;
}
