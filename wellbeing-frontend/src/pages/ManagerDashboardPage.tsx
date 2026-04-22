'use client';

import { useParams } from 'react-router-dom';
import { ManagerLayout } from '@/components/layouts/ManagerLayout';
import { TeamTab } from '@/components/dashboard/team/TeamTab'
import StatsPage from './StatsPage';
import { TasksTab } from '@/components/dashboard/tasks/TasksTab'

export default function ManagerDashboardPage() {
    const params = useParams();
    const tab = params.tab || 'overview';

    return (
        <ManagerLayout>
            <div className="h-full">
                {tab === 'overview' && <div className="p-6">Overview Tab (Coming Soon)</div>}
                {tab === 'tasks' && <TasksTab />}
                {tab === 'workload' && <div className="p-6">Workload Tab (Coming Soon)</div>}
                {tab === 'team' && <TeamTab />}
                {tab === 'leaderboard' && <div className="p-6">Leaderboard Tab (Coming Soon)</div>}
                {tab === 'stats' && <StatsPage />}
            </div>
        </ManagerLayout>
    );
}



// import React from 'react'
// import { useParams } from 'react-router-dom'
// import { ManagerLayout } from '@/components/layouts/ManagerLayout'
// import { Container } from '@/components/ui/Container'
// import { TasksTab } from '@/components/dashboard/tasks/TasksTab'

// // Placeholder tab components (build these next)
// const OverviewTab = () => <div className="p-8">Overview Tab - Coming</div>
// const WorkloadTab = () => <div className="p-8">Workload Tab - Coming</div>
// const TeamTab = () => <div className="p-8">Team Tab - Coming</div>
// const LeaderboardTab = () => <div className="p-8">Leaderboard Tab - Coming</div>

// export const ManagerDashboardPage: React.FC = () => {
//     const { tab = 'overview' } = useParams()

//     const renderTab = () => {
//         switch (tab) {
//             case 'overview':
//                 return <OverviewTab />
//             case 'tasks':
//                 return <TasksTab />
//             case 'workload':
//                 return <WorkloadTab />
//             case 'team':
//                 return <TeamTab />
//             case 'leaderboard':
//                 return <LeaderboardTab />
//             default:
//                 return <OverviewTab />
//         }
//     }

//     return (
//         <ManagerLayout>
//             <Container>{renderTab()}</Container>
//         </ManagerLayout>
//     )
// }