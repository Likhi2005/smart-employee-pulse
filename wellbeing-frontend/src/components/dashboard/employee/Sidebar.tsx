import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Inbox,
    Columns2,
    ShieldAlert,
    CalendarDays,
    TrendingUp,
    Sparkles,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

// ============================================================
// NAV CONFIG
// ============================================================

interface NavItem {
    label: string
    icon: React.ElementType
    path: string
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/employee' },
    { label: 'Priority Inbox', icon: Inbox, path: '/dashboard/inbox' },
    { label: 'My Work Pipeline', icon: Columns2, path: '/dashboard/kanban' },
    { label: 'Blockers', icon: ShieldAlert, path: '/dashboard/blockers' },
    { label: 'Calendar', icon: CalendarDays, path: '/dashboard/calendar' },
    { label: 'Performance', icon: TrendingUp, path: '/dashboard/performance' },
    { label: 'Insights', icon: Sparkles, path: '/dashboard/insights' },
]

// ============================================================
// COMPONENT
// ============================================================

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <aside
            className={[
                'relative flex flex-col border-r border-neutral-800 bg-neutral-950 transition-all duration-300 shrink-0',
                'h-full overflow-hidden',
                collapsed ? 'w-[70px]' : 'w-[220px]',
            ].join(' ')}
        >
            {/* Logo / Brand */}
            <div className="flex items-center h-[60px] px-4 border-b border-neutral-800">
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                        <Sparkles size={14} className="text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-sm font-semibold text-neutral-100 whitespace-nowrap tracking-tight">
                            PulseWork
                        </span>
                    )}
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {NAV_ITEMS.map(item => {
                    const Icon = item.icon
                    // exact match for overview, prefix match for others
                    const isActive =
                        item.path === '/dashboard/employee'
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path)

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            title={collapsed ? item.label : undefined}
                            className={[
                                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150',
                                'hover:bg-neutral-800/80',
                                isActive
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    : 'text-neutral-400 border border-transparent hover:text-neutral-200',
                            ].join(' ')}
                        >
                            <Icon
                                size={16}
                                className={[
                                    'shrink-0 transition-colors',
                                    isActive ? 'text-cyan-400' : 'text-neutral-500',
                                ].join(' ')}
                            />
                            {!collapsed && (
                                <span className="text-left truncate leading-none">
                                    {item.label}
                                </span>
                            )}
                            {/* Active dot when collapsed */}
                            {collapsed && isActive && (
                                <span className="absolute right-2 w-1 h-1 rounded-full bg-cyan-400" />
                            )}
                        </button>
                    )
                })}
            </nav>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(c => !c)}
                className="flex items-center justify-center h-10 border-t border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60 transition-colors shrink-0"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </aside>
    )
}
