import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { LandingPage } from '@/pages/LandingPage'
import ManagerDashboardPage from '@/pages/ManagerDashboardPage'
import StatsPage from '@/pages/StatsPage';

const EmployeeDashboardPage = () => <div>Employee Dashboard - Coming Soon</div>

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Manager Dashboard - No Auth for now */}
          <Route
            path="/dashboard/manager/:tab?"
            element={<ManagerDashboardPage />}
          />
          <Route path="/manager/stats" element={<StatsPage />} />

          {/* Employee Dashboard */}
          <Route
            path="/dashboard/employee"
            element={<EmployeeDashboardPage />}
          />
          



          {/* Generic dashboard redirect */}
          <Route
            path="/dashboard"
            element={<Navigate to="/dashboard/manager/overview" replace />}
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App


// import React from 'react'
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from 'react-router-dom'
// import { AuthProvider } from '@/context/AuthContext'
// import { ProtectedRoute } from '@/components/ProtectedRoute'
// import { LoginPage } from '@/pages/LoginPage'
// import { RegisterPage } from '@/pages/RegisterPage'
// import { LandingPage } from '@/pages/LandingPage'
// import { ManagerDashboardPage } from '@/pages/ManagerDashboardPage'

// // Placeholder components (we'll build these next)
// const ManagerDashboard = () => <div className="p-8">Manager Dashboard - Coming Soon</div>
// const EmployeeDashboard = () => <div className="p-8">Employee Dashboard - Coming Soon</div>
// const UnauthorizedPage = () => <div className="p-8">Unauthorized Access</div>

// const App: React.FC = () => {
//   return (
//     <Router>
//       <AuthProvider>
//         <Routes>
//           {/* Public routes */}
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />

//           {/* Manager protected routes */}
//           <Route
//             path="/dashboard/manager"
//             element={
//               <ProtectedRoute requiredRole="manager">
//                 <ManagerDashboard />
//               </ProtectedRoute>
//             }
//           />

//           {/* Employee protected routes */}
//           <Route
//             path="/dashboard/employee"
//             element={
//               <ProtectedRoute requiredRole="employee">
//                 <EmployeeDashboard />
//               </ProtectedRoute>
//             }
//           />

//           {/* Generic dashboard (redirects to role-specific) */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <DashboardRedirect />
//               </ProtectedRoute>
//             }
//           />

//           {/* Error routes */}
//           <Route path="/unauthorized" element={<UnauthorizedPage />} />
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   )
// }

// // Helper component to redirect to role-specific dashboard
// const DashboardRedirect: React.FC = () => {
//   const { user } = React.useContext(AuthProvider ?
//     require('@/context/AuthContext').AuthContext :
//     React.createContext({ user: null })
//   );

//   if (user?.role === 'manager') {
//     return <Navigate to="/dashboard/manager" replace />
//   }
//   return <Navigate to="/dashboard/employee" replace />
// }

// export default App