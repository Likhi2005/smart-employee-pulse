import React, { useState, useEffect } from 'react'
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
    const [activeMenuItemPath, setActiveMenuItemPath] = useState('/dashboard/manager/overview')
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        navigate('/login')
    }

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
                ],
            },
            // {
            //     title: 'Analytics',
            //     items: [
            //         {
            //             icon: BarChart3,
            //             label: 'Statistics',
            //             to: '/dashboard/manager/stats',
            //             subItems: [
            //                 { icon: BarChart3, label: 'Overview', to: '/dashboard/manager/stats' },
            //                 { icon: Users, label: 'Employees', to: '/dashboard/manager/stats?section=employees' },
            //                 { icon: TrendingUp, label: 'Trends', to: '/dashboard/manager/stats?section=trends' },
            //             ],
            //         },
            //     ],
            // },
            {
                title: 'Management',
                items: [
                    {
                        icon: CheckSquare,
                        label: 'Tasks',
                        to: '/dashboard/manager/tasks',
                        badge: 5,
                        subItems: [
                            { label: 'All Tasks', to: '/dashboard/manager/tasks?section=list' },
                            { label: 'Assign New', to: '/dashboard/manager/tasks?section=create' },
                            { label: 'History', to: '/dashboard/manager/tasks?section=history' },
                            { label: 'Templates', to: '/dashboard/manager/tasks?section=templates' },
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
                            // { icon: BarChart3, label: 'Performance', to: '/dashboard/manager/team?section=performance' },
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

    useEffect(() => {
        setActiveMenuItemPath(location.pathname)
        setIsDetailExpanded(true)
    }, [location.pathname])

    const getBasePath = (path: string) => path.split('?')[0]
    const currentBasePath = getBasePath(location.pathname)

    const iconRailItems = [
        {
            icon: BarChart3,
            to: '/dashboard/manager/overview',
            tooltip: 'Overview',
            isActive: currentBasePath === '/dashboard/manager/overview',
        },
        {
            icon: CheckSquare,
            to: '/dashboard/manager/tasks',
            tooltip: 'Tasks',
            isActive: currentBasePath === '/dashboard/manager/tasks',
        },
        {
            icon: Users,
            to: '/dashboard/manager/team',
            tooltip: 'Team',
            isActive: currentBasePath === '/dashboard/manager/team',
        },
        {
            icon: Trophy,
            to: '/dashboard/manager/leaderboard',
            tooltip: 'Leaderboard',
            isActive: currentBasePath === '/dashboard/manager/leaderboard',
        },
    ]

    return (
        <div className="flex">
            <SidebarIconRail
                items={iconRailItems}
                onLogout={handleLogout}
                isDetailExpanded={isDetailExpanded}
                onToggleDetail={() => setIsDetailExpanded(!isDetailExpanded)}
            />

            <motion.aside
                animate={{ width: isDetailExpanded ? 320 : 0, opacity: isDetailExpanded ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-black h-screen border-r border-neutral-800 flex flex-col overflow-hidden"
            >
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

                <div className="px-4 pt-4">
                    <SidebarSearch isCollapsed={false} />
                </div>

                <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
                    {sidebarData.sections.map((section, idx) => (
                        <MenuSection key={idx} title={section.title} isExpanded={isDetailExpanded}>
                            {section.items.map((item, itemIdx) => {
                                const itemBasePath = getBasePath(item.to)
                                const isItemActive = currentBasePath === itemBasePath

                                return (
                                    <NavMenuGroup
                                        key={itemIdx}
                                        icon={item.icon}
                                        label={item.label}
                                        to={item.to}
                                        subItems={item.subItems}
                                        isExpanded={isDetailExpanded}
                                        isActive={isItemActive}
                                        badge={item.badge}
                                    />
                                )
                            })}
                        </MenuSection>
                    ))}
                </nav>
            </motion.aside>
        </div>
    )
}