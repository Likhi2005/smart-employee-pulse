import React from 'react'
import { useEmployeeDashboardCtx } from '@/context/EmployeeDashboardContext'
import { PageWrapper } from '@/components/dashboard/employee/PageWrapper'
import { KanbanBoard } from '@/components/dashboard/employee/KanbanBoard'
import { FocusPanel } from '@/components/dashboard/employee/FocusPanel'

export default function KanbanPage() {
    const {
        kanbanColumns,
        bestNextTask,
        loading,
        error,
        dashboardData,
        onAccept,
        onReject,
        onComplete,
        refetch,
    } = useEmployeeDashboardCtx()

    return (
        <PageWrapper loading={loading && !dashboardData} error={error} onRetry={refetch}>
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
                {/* Left: Kanban */}
                <KanbanBoard
                    columns={kanbanColumns}
                    onAccept={onAccept}
                    onReject={onReject}
                    onComplete={onComplete}
                />

                {/* Right: Smart Focus */}
                <FocusPanel bestNextTask={bestNextTask} onAccept={onAccept} />
            </div>
        </PageWrapper>
    )
}
