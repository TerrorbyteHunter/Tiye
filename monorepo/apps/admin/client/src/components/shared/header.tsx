import { useLocation } from "wouter";
import { BellIcon, Menu, LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth.tsx";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // Map location to page title
  const getPageTitle = () => {
    switch (location) {
      case "/": return "Dashboard";
      case "/admins": return "Admins";
      case "/routes": return "Bus & Routes";
      case "/tickets": return "Tickets & Payments";
      case "/analytics": return "Analytics";
      case "/settings": return "System Settings";
      default: return "Dashboard";
    }
  };
  
  return (
    <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200/50 h-16 flex items-center px-6 justify-between shadow-sm">
      <div className="flex items-center">
        <button 
          type="button" 
          className="md:hidden text-gray-500 hover:text-gray-700 mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{getPageTitle()}</h2>
            <p className="text-xs text-gray-500">Welcome back, {user?.fullName}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="icon"
          className="relative p-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <BellIcon className="h-5 w-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-10 w-10 rounded-xl hover:bg-blue-50 transition-colors p-0"
            >
              <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <AvatarImage src="" alt={user?.fullName || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                  {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={user?.fullName || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold leading-none">{user?.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {user?.email}
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {user?.role} • Admin
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-3 cursor-pointer hover:bg-blue-50 rounded-lg">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 cursor-pointer hover:bg-blue-50 rounded-lg">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={logout}
              className="p-3 cursor-pointer hover:bg-red-50 text-red-600 rounded-lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
