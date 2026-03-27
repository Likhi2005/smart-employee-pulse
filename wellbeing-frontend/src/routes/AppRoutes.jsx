import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

// Pages
import Login from '../pages/Login'
import Register from '../pages/Register'
import EmployeeDashboard from '../pages/EmployeeDashboard'
import ManagerDashboard from '../pages/ManagerDashboard'
import AdminDashboard from '../pages/AdminDashboard'
import MoodCheck from '../pages/MoodCheck'
import WeeklyReport from '../pages/WeeklyReport'
import Chatbot from '../pages/Chatbot'
import Games from '../pages/Games'
import TaskManager from '../pages/TaskManager'
import Profile from '../pages/Profile'
import Settings from '../pages/Settings'

// Layouts
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'

function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, userRole } = useContext(AuthContext)

    if (!isAuthenticated) {
        return <Navigate to="/login" />
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/unauthorized" />
    }

    return children
}

function AppRoutes() {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                {/* Employee Routes */}
                <Route path="/dashboard" element={<EmployeeDashboard />} />
                <Route path="/mood-check" element={<MoodCheck />} />
                <Route path="/weekly-report" element={<WeeklyReport />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/games" element={<Games />} />
                <Route path="/tasks" element={<TaskManager />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />

                {/* Manager Routes */}
                <Route
                    path="/manager-dashboard"
                    element={
                        <ProtectedRoute requiredRole="manager">
                            <ManagerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    )
}

export default AppRoutes