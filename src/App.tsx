import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/store/auth";
import { seedIfNeeded } from "@/store/data";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import OrdersList from "@/pages/OrdersList";
import NewOrder from "@/pages/NewOrder";
import OrderDetail from "@/pages/OrderDetail";
import CustomersList from "@/pages/CustomersList";
import CustomerDetail from "@/pages/CustomerDetail";
import PriceListPage from "@/pages/PriceListPage";
import SettingsPage from "@/pages/SettingsPage";
import StatusCheck from "@/pages/StatusCheck";
import NotFound from "@/pages/NotFound";
import React from "react";

seedIfNeeded();

const queryClient = new QueryClient();

function ProtectedRoute({ children, ownerOnly = false }: { children: React.ReactNode; ownerOnly?: boolean }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (ownerOnly && user.role !== 'owner') return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/proveri-porudzbinu" element={<StatusCheck />} />
            <Route path="/status" element={<StatusCheck />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/porudzbine" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
            <Route path="/nova-porudzbina" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
            <Route path="/porudzbine/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/kupci" element={<ProtectedRoute><CustomersList /></ProtectedRoute>} />
            <Route path="/kupci/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
            <Route path="/cenovnik" element={<ProtectedRoute ownerOnly><PriceListPage /></ProtectedRoute>} />
            <Route path="/podesavanja" element={<ProtectedRoute ownerOnly><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
