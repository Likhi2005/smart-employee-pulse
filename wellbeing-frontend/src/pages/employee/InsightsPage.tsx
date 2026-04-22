import React from 'react'
import { useEmployeeDashboardCtx } from '@/context/EmployeeDashboardContext'
import { PageWrapper } from '@/components/dashboard/employee/PageWrapper'
import { CollaborationPanel } from '@/components/dashboard/employee/CollaborationPanel'
import { WellbeingPanel } from '@/components/dashboard/employee/WellbeingPanel'

export default function InsightsPage() {
    const { dashboardData, tasks, loading, error, refetch } = useEmployeeDashboardCtx()

    return (
        <PageWrapper loading={loading && !dashboardData} error={error} onRetry={refetch}>
            {dashboardData && (
                <>
                    <CollaborationPanel dashboardData={dashboardData} tasks={tasks} />
                    <WellbeingPanel dashboardData={dashboardData} tasks={tasks} />
                </>
            )}
        </PageWrapper>
    )
}
