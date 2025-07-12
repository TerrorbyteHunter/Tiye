import * as React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vendor } from '../lib/api';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import NotificationBar from './NotificationBar';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Ticket,
  Users,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  User,
  Map,
  Bus,
  Bell,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Routes', href: '/routes', icon: Map },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'History', href: '/history', icon: Clock },
  { name: 'Tickets', href: '/tickets', icon: Ticket },
  { name: 'Reports', href: '/reports', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Support', href: '/support', icon: HelpCircle },
];

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { data: vendorData = {
    id: 1,
    name: 'Mazhandu Family Bus Services',
    email: 'info@mazhandufamily.com',
    logo: '',
  } } = useQuery({
    queryKey: ['vendor'],
    queryFn: vendor.getProfile,
  });

  const handleLogout = () => {
    localStorage.removeItem('vendor_token');
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/routes', label: 'Routes', icon: Map },
    { path: '/buses', label: 'Buses', icon: Bus },
    { path: '/schedule', label: 'Schedule', icon: Calendar },
    { path: '/tickets', label: 'Tickets', icon: Ticket },
    { path: '/history', label: 'History', icon: Clock },
    { path: '/reports', label: 'Reports', icon: BarChart2 },
    { path: '/sales', label: 'Sales', icon: Users },
    { path: '/support', label: 'Support', icon: HelpCircle },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/profile/notifications', label: 'Notifications', icon: Bell },
  ];

  if (!vendorData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 w-64 h-screen transition-transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 glass shadow-xl
        `}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8 px-2">
            <Avatar className="h-12 w-12 shadow-md border-2 border-primary bg-white/80">
              <AvatarImage src={vendorData.logo} alt={vendorData.name} />
              <AvatarFallback>{vendorData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-lg leading-tight gradient-text">{vendorData.name}</h2>
              <p className="text-xs text-white/80">{vendorData.email}</p>
            </div>
          </div>

          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      group flex items-center px-4 py-2 rounded-lg transition-colors relative
                      sidebar-item
                      ${active ? 'bg-white/90 text-indigo-700 font-semibold shadow-md' : 'text-white/90 hover:bg-white/20 hover:text-white'}
                    `}
                  >
                    {/* Accent bar for active tab */}
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded bg-indigo-500" />
                    )}
                    <span className="mr-3 flex items-center justify-center">
                      <item.icon className={`h-5 w-5 ${active ? 'text-indigo-600' : 'text-white/80 group-hover:text-white'}`} />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="absolute bottom-4 left-0 right-0 px-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-100 hover:text-red-700 border-t border-white/20 mt-8 pt-4"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 pt-20 lg:pt-4">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <div className="flex flex-1 items-center gap-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-indigo-100 shadow-sm h-16">
                <Avatar className="h-10 w-10 border-2 border-indigo-200 bg-white/80">
                  <AvatarImage src={vendorData.logo} alt={vendorData.name} />
                  <AvatarFallback>{vendorData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-bold text-2xl gradient-text tracking-tight">{vendorData.name}</span>
              </div>
            </div>
            <div className="ml-4 flex items-center gap-4">
              <NotificationBar />
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">View profile</span>
                <User className="h-6 w-6" aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={handleLogout}
              >
                <span className="sr-only">Log out</span>
                <LogOut className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
} 