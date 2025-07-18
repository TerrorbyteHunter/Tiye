import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Ticket } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock } from "lucide-react";

interface RecentBookingsProps {
  bookings: Ticket[];
  isLoading?: boolean;
}

const StatusBadge = ({ status }: { status: Ticket["status"] }) => {
  switch (status) {
    case "confirmed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Confirmed
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pending
        </Badge>
      );
    case "refunded":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Refunded
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          Cancelled
        </Badge>
      );
    default:
      return null;
  }
};

export function RecentBookings({ bookings = [], isLoading = false }: RecentBookingsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-primary">
                  #{booking.bookingReference || booking.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 bg-gray-200 text-gray-500">
                      <AvatarFallback>
                        {booking.customerName ? booking.customerName.split(' ').map(n => n[0]).join('') : 'N/A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{booking.customerName || 'Unknown Customer'}</div>
                      <div className="text-sm text-gray-500">{booking.customerPhone || 'No phone'}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">{`Route #${booking.routeId}`}</div>
                  <div className="text-sm text-gray-500">{`Vendor #${booking.vendorId}`}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <CalendarDays className="h-3 w-3 text-muted-foreground" />
                    <span>Purchase: {format(new Date(booking.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 ml-4">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(booking.createdAt), 'HH:mm')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  K{booking.amount || 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {bookings.length} of {bookings.length} bookings
        </div>
        <div>
          <Button className="text-sm">
            View All
          </Button>
        </div>
      </div>
    </Card>
  );
}
