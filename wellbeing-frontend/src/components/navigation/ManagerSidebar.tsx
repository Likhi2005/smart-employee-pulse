import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3,
    CheckSquare,
    Users,
    Zap,
    Trophy,
    ChevronLeft,
    TrendingUp,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SidebarIconRail } from './shared/SidebarIconRail'
import { SidebarSearch } from './shared/SidebarSearch'
import { NavMenuGroup } from './shared/NavMenuGroup'
import { MenuSection } from './shared/MenuSection'

export const ManagerSidebar: React.FC = () => {
    const [isDetailExpanded, setIsDetailExpanded] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        navigate('/login')
    }

    // Manager sidebar data structure with sections
    const sidebarData = {
        sections: [
            {
                title: 'Dashboard',
                items: [
                    {
                        icon: BarChart3,
                        label: 'Overview',
                        to: '/dashboard/manager/overview',
                        subItems: [
                            { icon: BarChart3, label: 'Dashboard', to: '/dashboard/manager/overview' },
                            { icon: Zap, label: 'Quick Stats', to: '/dashboard/manager/overview?section=stats' },
                        ],
                    },
                    {
                        icon: BarChart3,
                        label: 'Analytics',
                        to: '/dashboard/manager/overview?section=analytics',
                        subItems: [],
                    },
                ],
            },
            {
                title: 'Analytics',
                items: [
                    {
                        icon: BarChart3,
                        label: 'Statistics',
                        to: '/manager/stats',
                        subItems: [
                            { icon: BarChart3, label: 'Overview', to: '/manager/stats' },
                            { icon: Users, label: 'Employees', to: '/manager/stats?section=employees' },
                            { icon: TrendingUp, label: 'Trends', to: '/manager/stats?section=trends' },
                        ],
                    },
                ],
            },
            {
                title: 'Management',
                items: [
                    {
                        icon: CheckSquare,
                        label: 'Tasks',
                        to: '/dashboard/manager/tasks',
                        badge: 5,
                        subItems: [
                            { label: 'All Tasks', to: '/dashboard/manager/tasks', icon: 'List' },
                            { label: 'Assign New', to: '/dashboard/manager/assign', icon: 'Plus' },
                            { label: 'Auto-Assign', to: '/dashboard/manager/auto-assign', icon: 'Zap' },
                            { label: 'History', to: '/dashboard/manager/history', icon: 'Clock' },
                            { label: 'Templates', to: '/dashboard/manager/templates', icon: 'Copy' }
                            // { icon: CheckSquare, label: 'All Tasks', to: '/dashboard/manager/tasks' },
                            // { icon: Zap, label: 'Assign New', to: '/dashboard/manager/tasks?action=new' },
                            // { icon: BarChart3, label: 'Task Reports', to: '/dashboard/manager/tasks?section=reports' },
                        ],
                    },
                    {
                        icon: Zap,
                        label: 'Workload',
                        to: '/dashboard/manager/workload',
                        subItems: [
                            { icon: Zap, label: 'Distribution', to: '/dashboard/manager/workload' },
                            { icon: BarChart3, label: 'Analytics', to: '/dashboard/manager/workload?section=analytics' },
                            { icon: Users, label: 'By Team', to: '/dashboard/manager/workload?section=team' },
                        ],
                    },
                ],
            },
            {
                title: 'People',
                items: [
                    {
                        icon: Users,
                        label: 'Team',
                        to: '/dashboard/manager/team',
                        subItems: [
                            { icon: Users, label: 'All Members', to: '/dashboard/manager/team' },
                            { icon: BarChart3, label: 'Performance', to: '/dashboard/manager/team?section=performance' },
                            { icon: Zap, label: 'Workload Status', to: '/dashboard/manager/team?section=workload' },
                        ],
                    },
                    {
                        icon: Trophy,
                        label: 'Leaderboard',
                        to: '/dashboard/manager/leaderboard',
                        subItems: [
                            { icon: Trophy, label: 'Top Performers', to: '/dashboard/manager/leaderboard' },
                            { icon: Zap, label: 'This Month', to: '/dashboard/manager/leaderboard?period=month' },
                            { icon: BarChart3, label: 'All Time', to: '/dashboard/manager/leaderboard?period=all' },
                        ],
                    },
                ],
            },
        ],
    }

    // Icon rail items
    const iconRailItems = [
        {
            icon: BarChart3,
            to: '/dashboard/manager/overview',
            tooltip: 'Overview',
            isActive: location.pathname === '/dashboard/manager/overview',
        },
        {
            icon: CheckSquare,
            to: '/dashboard/manager/tasks',
            tooltip: 'Tasks',
            isActive: location.pathname === '/dashboard/manager/tasks',
        },
        {
            icon: Zap,
            to: '/dashboard/manager/workload',
            tooltip: 'Workload',
            isActive: location.pathname === '/dashboard/manager/workload',
        },
        {
            icon: Users,
            to: '/dashboard/manager/team',
            tooltip: 'Team',
            isActive: location.pathname === '/dashboard/manager/team',
        },
        {
            icon: Trophy,
            to: '/dashboard/manager/leaderboard',
            tooltip: 'Leaderboard',
            isActive: location.pathname === '/dashboard/manager/leaderboard',
        },
    ]

    return (
        <div className="flex">
            {/* Icon Rail (Always Visible) */}
            <SidebarIconRail
                items={iconRailItems}
                onLogout={handleLogout}
                isDetailExpanded={isDetailExpanded}
                onToggleDetail={() => setIsDetailExpanded(!isDetailExpanded)}
            />

            {/* Detail Sidebar (Collapsible) */}
            <motion.aside
                animate={{ width: isDetailExpanded ? 320 : 0, opacity: isDetailExpanded ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-black h-screen border-r border-neutral-800 flex flex-col overflow-hidden"
            >
                {/* Header with Title & Collapse Button */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                    <div className="font-semibold text-neutral-50 text-lg">Navigation</div>
                    <motion.button
                        onClick={() => setIsDetailExpanded(false)}
                        whileHover={{ scale: 1.05 }}
                        className="p-1 hover:bg-neutral-800 rounded-md text-neutral-400 hover:text-neutral-200"
                    >
                        <ChevronLeft size={18} />
                    </motion.button>
                </div>

                {/* Search */}
                <div className="px-4 pt-4">
                    <SidebarSearch isCollapsed={false} />
                </div>

                {/* Menu Sections (Scrollable) */}
                <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
                    {sidebarData.sections.map((section, idx) => (
                        <MenuSection key={idx} title={section.title} isExpanded={isDetailExpanded}>
                            {section.items.map((item, itemIdx) => (
                                <NavMenuGroup
                                    key={itemIdx}
                                    icon={item.icon}
                                    label={item.label}
                                    subItems={item.subItems}
                                    isExpanded={isDetailExpanded}
                                />
                            ))}
                        </MenuSection>
                    ))}
                </nav>
            </motion.aside>
        </div>
    )
}



// const navigationItems = [
//     {
//         label: 'Overview',
//         route: '/dashboard/manager/overview',
//         icon: 'LayoutDashboard',
//         section: 'main'
//     },
//     {
//         label: 'Statistics',
//         route: '/dashboard/manager/stats',
//         icon: 'BarChart3',
//         section: 'main'
//     },
//     {
//         label: 'Tasks',
//         icon: 'ListTodo',
//         section: 'tasks',
//         children: [
//             { label: 'All Tasks', route: '/dashboard/manager/tasks', icon: 'List' },
//             { label: 'Assign New', route: '/dashboard/manager/assign', icon: 'Plus' },
//             { label: 'Auto-Assign', route: '/dashboard/manager/auto-assign', icon: 'Zap' },
//             { label: 'History', route: '/dashboard/manager/history', icon: 'Clock' },
//             { label: 'Templates', route: '/dashboard/manager/templates', icon: 'Copy' }
//         ]
//     },
//     {
//         label: 'Reports',
//         route: '/dashboard/manager/reports',
//         icon: 'FileText',
//         section: 'main'
//     }
// ];