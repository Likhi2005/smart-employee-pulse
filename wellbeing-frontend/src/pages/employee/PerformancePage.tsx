import React from 'react'
import { useEmployeeDashboardCtx } from '@/context/EmployeeDashboardContext'
import { PageWrapper } from '@/components/dashboard/employee/PageWrapper'
import { PerformancePanel } from '@/components/dashboard/employee/PerformancePanel'

export default function PerformancePage() {
    const { dashboardData, loading, error, refetch } = useEmployeeDashboardCtx()

    return (
        <PageWrapper loading={loading && !dashboardData} error={error} onRetry={refetch}>
            {dashboardData && <PerformancePanel dashboardData={dashboardData} />}
        </PageWrapper>
    )
}
