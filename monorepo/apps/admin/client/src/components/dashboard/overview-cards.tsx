import { 
  Ticket, 
  DollarSign, 
  Users, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Minus 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: "bookings" | "revenue" | "vendors" | "routes";
  change?: {
    type: "increase" | "decrease" | "neutral";
    value: string;
    text: string;
  };
}

const CardIcon = ({ type }: { type: StatsCardProps["icon"] }) => {
  switch (type) {
    case "bookings":
      return (
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
          <Ticket className="h-7 w-7 text-white" />
        </div>
      );
    case "revenue":
      return (
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
          <DollarSign className="h-7 w-7 text-white" />
        </div>
      );
    case "vendors":
      return (
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
          <Users className="h-7 w-7 text-white" />
        </div>
      );
    case "routes":
      return (
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
          <MapPin className="h-7 w-7 text-white" />
        </div>
      );
    default:
      return null;
  }
};

const ChangeIndicator = ({ change }: { change?: StatsCardProps["change"] }) => {
  if (!change) return null;
  
  let Icon;
  let textColor;
  let bgColor;
  
  switch (change.type) {
    case "increase":
      Icon = TrendingUp;
      textColor = "text-green-600";
      bgColor = "bg-green-50";
      break;
    case "decrease":
      Icon = TrendingDown;
      textColor = "text-red-600";
      bgColor = "bg-red-50";
      break;
    case "neutral":
      Icon = Minus;
      textColor = "text-amber-600";
      bgColor = "bg-amber-50";
      break;
  }
  
  return (
    <div className="mt-4 flex items-center">
      <span className={`${bgColor} ${textColor} px-2 py-1 rounded-full text-xs font-medium flex items-center`}>
        <Icon className="h-3 w-3 mr-1" />
        {change.value}
      </span>
      <span className="text-gray-500 ml-2 text-sm">{change.text}</span>
    </div>
  );
};

export function StatsCard({ title, value, icon, change }: StatsCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            <ChangeIndicator change={change} />
          </div>
          <div className="ml-4 group-hover:scale-110 transition-transform duration-300">
            <CardIcon type={icon} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OverviewCardsProps {
  stats: {
    totalBookings: number;
    totalRevenue: number;
    activeVendors: number;
    activeRoutes: number;
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
  };
  isLoading?: boolean;
}

export function OverviewCards({ stats, isLoading = false }: OverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="h-32 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Bookings"
        value={stats.totalBookings.toLocaleString()}
        icon="bookings"
        change={stats.bookingChange}
      />
      
      <StatsCard
        title="Total Revenue"
        value={`K${stats.totalRevenue.toLocaleString()}`}
        icon="revenue"
        change={stats.revenueChange}
      />
      
      <StatsCard
        title="Active Vendors"
        value={stats.activeVendors}
        icon="vendors"
        change={stats.vendorChange}
      />
      
      <StatsCard
        title="Active Routes"
        value={stats.activeRoutes}
        icon="routes"
        change={stats.routeChange}
      />
    </div>
  );
}
