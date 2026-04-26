import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BarChart3,
    CheckSquare,
    Users,
    Zap,
    Trophy,
    ChevronLeft,
    ChevronRight,
    Settings,
    LogOut,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SidebarSearch } from './shared/SidebarSearch'
import { NavMenuGroup } from './shared/NavMenuGroup'
import { MenuSection } from './shared/MenuSection'

export const ManagerSidebar: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(true)
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
                            { label: 'AI Automation', to: '/dashboard/manager/tasks?section=ai-automation' },
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
        // Optional: auto-expand or handle active state based on route
    }, [location.pathname])

    const getBasePath = (path: string) => path.split('?')[0]
    const currentBasePath = getBasePath(location.pathname)

    return (
        <motion.aside
            animate={{ width: isExpanded ? 280 : 80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-screen bg-neutral-950 border-r border-neutral-800 flex flex-col z-20 relative overflow-hidden shrink-0"
        >
            {/* Header / Logo */}
            <div className="h-16 flex items-center px-4 border-b border-neutral-800/50 shrink-0 justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="size-8 rounded bg-amber-600 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">WP</span>
                    </div>
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-semibold text-neutral-100 whitespace-nowrap"
                            >
                                Manager Portal
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                
                {isExpanded && (
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="p-1 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}
            </div>

            {/* Expand Button (when collapsed) */}
            {!isExpanded && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="p-2 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div className={`px-4 pt-4 shrink-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <SidebarSearch isCollapsed={!isExpanded} />
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-6 stylish-scrollbar">
                {sidebarData.sections.map((section, idx) => (
                    <MenuSection key={idx} title={section.title} isExpanded={isExpanded}>
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
                                    isExpanded={isExpanded}
                                    isActive={isItemActive}
                                    badge={item.badge}
                                />
                            )
                        })}
                    </MenuSection>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-neutral-800/50 shrink-0 flex flex-col gap-2">
                <button
                    className={`flex items-center gap-3 p-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors ${
                        !isExpanded && 'justify-center'
                    }`}
                    title="Settings"
                >
                    <Settings size={20} className="shrink-0" />
                    {isExpanded && <span className="font-medium text-sm whitespace-nowrap">Settings</span>}
                </button>
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 p-2 rounded-lg text-red-400/80 hover:bg-red-950/50 hover:text-red-400 transition-colors ${
                        !isExpanded && 'justify-center'
                    }`}
                    title="Logout"
                >
                    <LogOut size={20} className="shrink-0" />
                    {isExpanded && <span className="font-medium text-sm whitespace-nowrap">Logout</span>}
                </button>
            </div>
        </motion.aside>
    )
}