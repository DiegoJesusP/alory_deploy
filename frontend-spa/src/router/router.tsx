import type { JSX } from "react";
import { Routes, Route } from "react-router";
import LandingPage from "@/pages/landing/LandingPage";
import { LoginPage } from "@/modules/auth/ui/LoginPage";
import { ForgotPasswordPage } from "@/modules/auth/ui/ForgotPasswordPage";
import { ResetPasswordPage } from "@/modules/auth/ui/ResetPasswordPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import Dashboard from "@/pages/dashboard/Dashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import ClientsPage from "@/pages/clients/Clients";
import ProductsPage from "@/pages/products/Products";
import AdminAppointmentsPage from "@/pages/admin/Appointments";
import AdminServicesPage from "@/pages/admin/Services";
import AdminEmployeesPage from "@/pages/admin/Employees";
import { useAuth } from "@/hooks/useAuth";

const RoleDashboard = (): JSX.Element => {
    const { user } = useAuth();

    if (user?.role === "ADMIN") {
        return <AdminDashboard />;
    }

    return <Dashboard />;
};

const AppRouter = (): JSX.Element => {
    return (
        <Routes>
            {/* Public */}
            <Route path="/"                element={<LandingPage />} />
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />

            {/* Protected — shared dashboard */}
            <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                    <RoleDashboard />
                </ProtectedRoute>
            } />
            {/* Protected — EMPLOYEE only */}
            <Route path="/dashboard/clientes" element={
                <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                    <ClientsPage />
                </ProtectedRoute>
            } />
            <Route path="/dashboard/citas" element={
                <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                    <AdminAppointmentsPage />
                </ProtectedRoute>
            } />

            {/* Protected — ADMIN only */}
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="/admin/clientes" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ClientsPage />
                </ProtectedRoute>
            } />
            <Route path="/admin/inventario" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ProductsPage />
                </ProtectedRoute>
            } />
            <Route path="/admin/productos" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ProductsPage />
                </ProtectedRoute>
            } />
            <Route path="/admin/citas" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminAppointmentsPage />
                </ProtectedRoute>
            } />
            <Route path="/admin/servicios" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminServicesPage />
                </ProtectedRoute>
            } />
            <Route path="/admin/empleados" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminEmployeesPage />
                </ProtectedRoute>
            } />
        </Routes>
    );
};

export default AppRouter;
