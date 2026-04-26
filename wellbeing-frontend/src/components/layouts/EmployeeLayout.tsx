import { Outlet } from 'react-router-dom'
import { EmployeeDashboardProvider, useEmployeeDashboardCtx } from '@/context/EmployeeDashboardContext'
import { Sidebar } from '@/components/dashboard/employee/Sidebar'
import { TopBar } from '@/components/dashboard/employee/TopBar'
import { TaskDetailModal } from '@/components/dashboard/employee/TaskDetailModal'

// ============================================================
// INNER SHELL (has access to context)
// ============================================================

function EmployeeShell() {
    const { dashboardData, loading, searchQuery, setSearchQuery, refetch, selectedTask, setSelectedTask } = useEmployeeDashboardCtx()
    const pendingCount = dashboardData?.taskStats.pending ?? 0

    return (
        <div className="flex h-screen overflow-hidden bg-neutral-950 text-neutral-100">
            {/* Persistent Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                {/* Persistent TopBar */}
                <TopBar
                    pendingCount={pendingCount}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onRefresh={refetch}
                    refreshing={loading}
                />

                {/* Route content renders here */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Global Task Detail Modal */}
            <TaskDetailModal 
                task={selectedTask} 
                onClose={() => setSelectedTask(null)} 
            />
        </div>
    )
}

// ============================================================
// LAYOUT EXPORT (wraps shell in data provider)
// ============================================================

export function EmployeeLayout() {
    return (
        <EmployeeDashboardProvider>
            <EmployeeShell />
        </EmployeeDashboardProvider>
    )
}