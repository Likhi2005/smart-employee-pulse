import React from 'react'
import { useEmployeeDashboardCtx } from '@/context/EmployeeDashboardContext'
import { PageWrapper } from '@/components/dashboard/employee/PageWrapper'
import { PriorityInbox } from '@/components/dashboard/employee/PriorityInbox'

export default function PriorityInboxPage() {
    const {
        urgencySortedTasks,
        loading,
        error,
        dashboardData,
        searchQuery,
        onAccept,
        onReject,
        onComplete,
        refetch,
    } = useEmployeeDashboardCtx()

    return (
        <PageWrapper loading={loading && !dashboardData} error={error} onRetry={refetch}>
            <PriorityInbox
                tasks={urgencySortedTasks}
                searchQuery={searchQuery}
                onAccept={onAccept}
                onReject={onReject}
                onComplete={onComplete}
            />
        </PageWrapper>
    )
}
