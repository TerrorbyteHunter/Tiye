import * as React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Login2FA from './pages/Login2FA';
import VerifyEmail from './pages/VerifyEmail';
import RoutesPage from './pages/Routes';
import Profile from './pages/Profile';
import Schedule from './pages/Schedule';
import History from './pages/History';
import Tickets from './pages/Tickets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Buses from './pages/Buses';
import { createBrowserRouter } from 'react-router-dom';
import ProfileHub from './pages/Profile';
import EditProfile from './pages/EditProfile';
import NotificationsPage from './pages/notifications';
import SalesPage from './pages/Sales';
import NotFound from './pages/NotFound';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('vendor_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'routes',
        element: <RoutesPage />,
      },
      {
        path: 'buses',
        element: <Buses />,
      },
      {
        path: 'schedule',
        element: <Schedule />,
      },
      {
        path: 'history',
        element: <History />,
      },
      {
        path: 'tickets',
        element: <Tickets />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'support',
        element: <Support />,
      },
      {
        path: 'sales',
        element: <SalesPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default function Routes() {
  return (
    <RouterRoutes>
      <Route path="/login" element={<Login />} />
      <Route path="/login-2fa" element={<Login2FA />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      <Route element={
        <RequireAuth>
          <Layout />
        </RequireAuth>
      }>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/profile" element={<ProfileHub />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/notifications" element={<NotificationsPage />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/history" element={<History />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/support" element={<Support />} />
        <Route path="/buses" element={<Buses />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </RouterRoutes>
  );
} 