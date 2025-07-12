import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import VendorLogin from "@/pages/vendor-login";
import Vendors from "@/pages/vendors";
import Routes from "@/pages/routes";
import Tickets from "@/pages/tickets";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import { AuthProvider, useAuth } from "@/lib/auth.tsx";
import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { MobileSidebar } from "@/components/shared/mobile-sidebar";
import { useState, useEffect } from "react";
import { SessionTimeout } from "@/components/shared/session-timeout";
import Management from "@/pages/management";
import RolesPage from "@/pages/roles";
import AuditLogsPage from "@/pages/audit-logs";
import ProfileHub from "@/pages/profile";
import EditProfile from "@/pages/edit-profile";
import NotificationsPage from "@/pages/notifications";
import Customers from "@/pages/customers";
import Admins from "@/pages/admins";
import PaymentTestingPage from "@/pages/payment-testing";
import { Footer } from "@/components/shared/footer";


function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? <Component {...rest} /> : null;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated || location === "/login" || location === "/auth") {
    return <>{children}</>;
  }

  return (
    <div className="bg-gray-50 h-screen flex overflow-hidden">
      <Sidebar />
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 custom-scrollbar">
          {children}
          <SessionTimeout />
        </div>
        <Footer />
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/vendor-login" component={VendorLogin} />
      <Route path="/auth" component={Login} />
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/vendors">
        <ProtectedRoute component={Vendors} />
      </Route>
      <Route path="/routes">
        <ProtectedRoute component={Routes} />
      </Route>
      <Route path="/tickets">
        <ProtectedRoute component={Tickets} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={Analytics} />
      </Route>
      <Route path="/admins">
        <ProtectedRoute component={Admins} />
      </Route>
      <Route path="/customers">
        <ProtectedRoute component={Customers} />
      </Route>
      <Route path="/roles">
        <ProtectedRoute component={RolesPage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      <Route path="/audit-logs">
        <ProtectedRoute component={AuditLogsPage} />
      </Route>
      <Route path="/notifications">
        <ProtectedRoute component={NotificationsPage} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={ProfileHub} />
      </Route>
      <Route path="/profile/edit">
        <ProtectedRoute component={EditProfile} />
      </Route>
      <Route path="/profile/notifications">
        <ProtectedRoute component={NotificationsPage} />
      </Route>
      <Route path="/payment-testing">
        <ProtectedRoute component={PaymentTestingPage} />
      </Route>
      <Route path="/admins">
        <ProtectedRoute component={Admins} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;