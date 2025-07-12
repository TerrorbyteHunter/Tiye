import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Routes as RoutesPage } from './pages/Routes';
import { Login } from './pages/Login';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="routes" element={<RoutesPage />} />
      </Route>
    </Routes>
  );
};

export default App; 