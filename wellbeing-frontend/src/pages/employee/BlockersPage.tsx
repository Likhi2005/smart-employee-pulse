import React from 'react'
import { useEmployeeDashboardCtx } from '@/context/EmployeeDashboardContext'
import { PageWrapper } from '@/components/dashboard/employee/PageWrapper'
import { BlockersPanel } from '@/components/dashboard/employee/BlockersPanel'

export default function BlockersPage() {
    const { blockedTasks, loading, error, dashboardData, onReject, refetch, setSelectedTask } =
        useEmployeeDashboardCtx()

    return (
        <PageWrapper loading={loading && !dashboardData} error={error} onRetry={refetch}>
            <BlockersPanel blockedTasks={blockedTasks} onReject={onReject} onOpenDetails={setSelectedTask} />
        </PageWrapper>
    )
}
