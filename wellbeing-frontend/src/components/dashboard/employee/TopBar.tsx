import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, LogOut, ChevronDown, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ============================================================
// ROUTE → TITLE MAP
// ============================================================

const ROUTE_TITLES: Record<string, { title: string; sub: string }> = {
    '/dashboard/employee': { title: 'Dashboard Overview', sub: 'Your work command center' },
    '/dashboard/inbox': { title: 'Priority Inbox', sub: 'Ranked by urgency score' },
    '/dashboard/kanban': { title: 'My Work Pipeline', sub: 'Visualize your task flow' },
    '/dashboard/blockers': { title: 'Blockers & Dependencies', sub: 'Identify and resolve blockers' },
    '/dashboard/calendar': { title: 'Calendar & Capacity', sub: '7-day workload forecast' },
    '/dashboard/performance': { title: 'Performance & Growth', sub: 'Points, rank, and trends' },
    '/dashboard/insights': { title: 'Insights', sub: 'Collaboration and wellbeing' },
}

// ============================================================
// PROPS
// ============================================================

interface TopBarProps {
    pendingCount: number
    searchQuery: string
    onSearchChange: (q: string) => void
    onRefresh: () => void
    refreshing: boolean
}

// ============================================================
// COMPONENT
// ============================================================

export function TopBar({
    pendingCount,
    searchQuery,
    onSearchChange,
    onRefresh,
    refreshing,
}: TopBarProps) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [profileOpen, setProfileOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)

    const routeInfo = ROUTE_TITLES[location.pathname] ?? { title: 'Employee Dashboard', sub: '' }

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false)
                setNotifOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    function handleLogout() {
        logout()
        navigate('/login', { replace: true })
    }

    const initials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : 'E'

    return (
        <header className="sticky top-0 z-20 flex items-center gap-4 h-[60px] px-5 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md shrink-0">
            {/* Page context */}
            <div className="flex-1 min-w-0">
                <h1 className="text-sm font-semibold text-neutral-100 truncate leading-tight">
                    {routeInfo.title}
                </h1>
                <p className="text-[11px] text-neutral-500 hidden sm:block leading-tight">
                    {routeInfo.sub}
                </p>
            </div>

            {/* Search — only on inbox and kanban pages */}
            {['/dashboard/inbox', '/dashboard/kanban'].includes(location.pathname) && (
                <div className="hidden md:flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 w-56 focus-within:border-cyan-500/50 transition-colors">
                    <Search size={13} className="text-neutral-500 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search tasks…"
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        className="bg-transparent text-sm text-neutral-300 placeholder-neutral-600 outline-none w-full"
                    />
                </div>
            )}

            {/* Refresh */}
            <button
                onClick={onRefresh}
                disabled={refreshing}
                title="Refresh data"
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors disabled:opacity-40"
            >
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            </button>

            {/* Notifications */}
            <div className="relative">
                <button
                    onClick={() => { setNotifOpen(n => !n); setProfileOpen(false) }}
                    className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                    <Bell size={14} />
                    {pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white leading-none">
                            {pendingCount > 9 ? '9+' : pendingCount}
                        </span>
                    )}
                </button>

                {notifOpen && (
                    <div className="absolute right-0 top-11 w-72 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl shadow-black/30 z-50 p-3">
                        <p className="text-xs font-semibold text-neutral-300 mb-2.5">Notifications</p>
                        {pendingCount > 0 ? (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                <Bell size={12} className="text-cyan-400 shrink-0" />
                                <p className="text-xs text-neutral-300">
                                    <span className="font-semibold text-cyan-400">{pendingCount}</span> task{pendingCount !== 1 ? 's' : ''} awaiting your action
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-500">No new notifications</p>
                        )}
                    </div>
                )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
                <button
                    onClick={() => { setProfileOpen(p => !p); setNotifOpen(false) }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 transition-colors"
                >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {initials}
                    </div>
                    <span className="text-xs font-medium text-neutral-200 hidden sm:block max-w-[80px] truncate">
                        {user?.fullName || 'Employee'}
                    </span>
                    <ChevronDown size={11} className="text-neutral-500" />
                </button>

                {profileOpen && (
                    <div className="absolute right-0 top-11 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl shadow-black/30 z-50 overflow-hidden">
                        <div className="p-3 border-b border-neutral-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-neutral-100 truncate">{user?.fullName}</p>
                                    <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <p className="mt-1.5 text-[10px] text-cyan-500 font-semibold uppercase tracking-wide">
                                Employee
                            </p>
                        </div>
                        <div className="p-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                                <LogOut size={13} />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
