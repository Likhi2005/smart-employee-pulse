import React from 'react'
import { useEmployeeDashboardCtx } from '@/context/EmployeeDashboardContext'
import { PageWrapper } from '@/components/dashboard/employee/PageWrapper'
import { CalendarCapacityStrip } from '@/components/dashboard/employee/CalendarCapacityStrip'
import { WellbeingPanel } from '@/components/dashboard/employee/WellbeingPanel'

export default function CalendarPage() {
    const { dashboardData, tasks, loading, error, refetch } = useEmployeeDashboardCtx()

    return (
        <PageWrapper loading={loading && !dashboardData} error={error} onRetry={refetch}>
            {dashboardData && (
                <>
                    <CalendarCapacityStrip tasks={tasks} dashboardData={dashboardData} />
                    <WellbeingPanel dashboardData={dashboardData} tasks={tasks} />
                </>
            )}
        </PageWrapper>
    )
}
