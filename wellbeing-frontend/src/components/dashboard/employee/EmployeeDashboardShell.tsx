// EmployeeDashboardShell — thin wrapper for backwards compat with EmployeeDashboardPage
// The full dashboard is now implemented in EmployeeDashboard.tsx
export { EmployeeDashboard as EmployeeDashboardShell } from './EmployeeDashboard'

// Keep type export so EmployeeDashboardPage import still resolves
export type EmployeeDashboardSection = 'focus' | 'pipeline' | 'signals' | 'insights'