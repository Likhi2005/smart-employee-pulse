import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { LandingPage } from '@/pages/LandingPage'
import ManagerDashboardPage from '@/pages/ManagerDashboardPage'
import EmployeeDashboardPage from '@/pages/EmployeeDashboardPage'
import { useAuth } from '@/hooks/useAuth'

const UnauthorizedPage = () => <div className="p-8">Unauthorized Access</div>

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Manager protected routes */}
          <Route
            path="/dashboard/manager/:tab/*"
            element={
              <ProtectedRoute requiredRole="manager">
                <ManagerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/manager"
            element={<Navigate to="/dashboard/manager/overview" replace />}
          />

          {/* Employee protected routes */}
          <Route
            path="/dashboard/employee/*"
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Generic dashboard (redirects by role) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Error routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth()

  if (user?.role === 'manager') {
    return <Navigate to="/dashboard/manager" replace />
  }

  return <Navigate to="/dashboard/employee" replace />
}

export default App