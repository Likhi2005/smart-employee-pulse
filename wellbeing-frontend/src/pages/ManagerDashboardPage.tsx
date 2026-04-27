'use client'

import { useParams, Navigate } from 'react-router-dom'
import { ManagerLayout } from '@/components/layouts/ManagerLayout'
import { TeamTab } from '@/components/dashboard/team/TeamTab'
import { LeaderboardView } from '@/features/people/views/LeaderboardView'
import { TasksTab } from '@/components/dashboard/tasks/TasksTab'
import { ManagerOverviewTab } from '@/components/dashboard/manager/ManagerOverviewTab'
import { WorkloadStatusView } from '@/features/people/views/WorkloadStatusView'

export default function ManagerDashboardPage() {
    const params = useParams()
    const tab = params.tab || 'overview'

    return (
        <ManagerLayout>
            <div className="min-h-full p-6">
                {tab === 'overview' && <ManagerOverviewTab />}
                {tab === 'tasks' && <TasksTab />}
                {tab === 'team' && <TeamTab />}
                {tab === 'workload' && <WorkloadStatusView />}
                {tab === 'leaderboard' && <LeaderboardView />}
                {!['overview', 'stats', 'tasks', 'workload', 'team', 'leaderboard'].includes(tab) && (
                    <Navigate to="/dashboard/manager/overview" replace />
                )}
            </div>
        </ManagerLayout>
    )
}