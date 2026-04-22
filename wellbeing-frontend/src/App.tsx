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
import { EmployeeLayout } from '@/components/layouts/EmployeeLayout'
import { useAuth } from '@/hooks/useAuth'

// Employee page imports
import EmployeeOverviewPage from '@/pages/employee/EmployeeOverviewPage'
import PriorityInboxPage from '@/pages/employee/PriorityInboxPage'
import KanbanPage from '@/pages/employee/KanbanPage'
import BlockersPage from '@/pages/employee/BlockersPage'
import CalendarPage from '@/pages/employee/CalendarPage'
import PerformancePage from '@/pages/employee/PerformancePage'
import InsightsPage from '@/pages/employee/InsightsPage'

const UnauthorizedPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-neutral-100">
    <div className="text-center">
      <p className="text-4xl font-bold text-rose-400 mb-2">403</p>
      <p className="text-neutral-400">Unauthorized Access</p>
    </div>
  </div>
)

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ── Public Routes ──────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Manager Routes (unchanged) ─────────────── */}
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

          {/* ── Employee Layout Shell ──────────────────── */}
          {/*
            EmployeeLayout renders: <Sidebar /> + <TopBar /> + <Outlet />
            All child routes render inside the <Outlet />.
            ProtectedRoute renders children directly (<>...</>), so Outlet works.
          */}
          <Route
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard/employee" element={<EmployeeOverviewPage />} />
            <Route path="/dashboard/inbox" element={<PriorityInboxPage />} />
            <Route path="/dashboard/kanban" element={<KanbanPage />} />
            <Route path="/dashboard/blockers" element={<BlockersPage />} />
            <Route path="/dashboard/calendar" element={<CalendarPage />} />
            <Route path="/dashboard/performance" element={<PerformancePage />} />
            <Route path="/dashboard/insights" element={<InsightsPage />} />
          </Route>

          {/* ── Generic /dashboard — redirects by role ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* ── Error & Fallback ───────────────────────── */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth()
  if (user?.role === 'manager') return <Navigate to="/dashboard/manager" replace />
  return <Navigate to="/dashboard/employee" replace />
}

export default App