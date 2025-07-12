import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  FileText, 
  Ticket, 
  BarChart3, 
  Settings, 
  MapPin,
  Building2,
  UserCog,
  Shield,
  FileSearch,
  UserCircle,
  Bell,
  Sparkles,
  CreditCard
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
  colorClass?: string;
}

const SidebarItem = ({ href, icon, children, isActive, colorClass }: SidebarItemProps) => {
  return (
    <a 
      href={href} 
      className={cn(
        "sidebar-item flex items-center py-3 px-4 rounded-2xl text-sm font-medium transition-all duration-200 group gap-3",
        isActive 
          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl ring-2 ring-blue-300/40"
          : "text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md"
      )}
      style={{backdropFilter: isActive ? 'blur(8px)' : undefined, WebkitBackdropFilter: isActive ? 'blur(8px)' : undefined}}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-lg transition-all duration-200",
          colorClass,
          isActive ? "scale-110 shadow-lg" : "opacity-90 group-hover:scale-105 group-hover:shadow-md"
        )}
        style={{ minWidth: 36, minHeight: 36 }}
      >
        {icon}
      </span>
      <span className="ml-1">{children}</span>
      {isActive && (
        <span className="ml-auto w-2 h-2 bg-white/80 rounded-full shadow-lg animate-pulse"></span>
      )}
    </a>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  
  return (
    <aside className="backdrop-blur-xl bg-white/70 border-r border-gray-200/50 w-64 h-full flex-shrink-0 shadow-2xl rounded-tr-3xl rounded-br-3xl overflow-hidden hidden md:block">
      <div className="h-20 px-6 flex items-center border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg shadow">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Tiyende</h1>
            <p className="text-xs text-blue-100">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="px-3 pt-6 h-[calc(100%-5rem)] overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          <SidebarItem 
            href="/" 
            icon={<Home className="h-6 w-6" />} 
            isActive={location === "/"}
            colorClass="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
          >
            Dashboard
          </SidebarItem>
          
          <div className="py-4">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider px-4 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Management
            </p>
            <div className="space-y-1">
              <SidebarItem 
                href="/admins" 
                icon={<UserCog className="h-6 w-6" />} 
                isActive={location === "/admins"}
                colorClass="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
              >
                Admins
              </SidebarItem>
              <SidebarItem 
                href="/customers" 
                icon={<Users className="h-6 w-6" />} 
                isActive={location === "/customers"}
                colorClass="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
              >
                Customers
              </SidebarItem>
              <SidebarItem 
                href="/vendors" 
                icon={<Building2 className="h-6 w-6" />} 
                isActive={location === "/vendors"}
                colorClass="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
              >
                Vendors
              </SidebarItem>
              <SidebarItem 
                href="/routes" 
                icon={<MapPin className="h-6 w-6" />} 
                isActive={location === "/routes"}
                colorClass="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
              >
                Bus & Routes
              </SidebarItem>
              <SidebarItem 
                href="/tickets" 
                icon={<Ticket className="h-6 w-6" />} 
                isActive={location === "/tickets"}
                colorClass="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
              >
                Tickets & Payments
              </SidebarItem>
              <SidebarItem 
                href="/notifications" 
                icon={<Bell className="h-6 w-6" />} 
                isActive={location === "/notifications"}
                colorClass="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
              >
                Notifications
              </SidebarItem>
            </div>
          </div>
          
          <div className="py-4">
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider px-4 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Reports
            </p>
            <div className="space-y-1">
              <SidebarItem 
                href="/analytics" 
                icon={<BarChart3 className="h-6 w-6" />} 
                isActive={location === "/analytics"}
                colorClass="bg-gradient-to-br from-green-100 to-green-200 text-green-700"
              >
                Analytics
              </SidebarItem>
            </div>
          </div>
          
          <div className="py-4">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider px-4 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Configuration
            </p>
            <div className="space-y-1">
              <SidebarItem 
                href="/roles" 
                icon={<Shield className="h-6 w-6" />} 
                isActive={location === "/roles"}
                colorClass="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700"
              >
                Roles & Permissions
              </SidebarItem>
              <SidebarItem 
                href="/audit-logs" 
                icon={<FileSearch className="h-6 w-6" />} 
                isActive={location === "/audit-logs"}
                colorClass="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700"
              >
                Audit Logs
              </SidebarItem>
              <SidebarItem 
                href="/settings" 
                icon={<Settings className="h-6 w-6" />} 
                isActive={location === "/settings"}
                colorClass="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700"
              >
                System Settings
              </SidebarItem>
              <SidebarItem 
                href="/payment-testing" 
                icon={<CreditCard className="h-6 w-6" />} 
                isActive={location === "/payment-testing"}
                colorClass="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700"
              >
                Payment Testing
              </SidebarItem>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
