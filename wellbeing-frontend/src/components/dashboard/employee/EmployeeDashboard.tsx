import React, { useState } from 'react'
import { useEmployeeDashboard } from '@/hooks/useEmployeeDashboard'
import { Sidebar, type SidebarSection } from './Sidebar'
import { TopBar } from './TopBar'
import { HeroDecisionBand } from './HeroDecisionBand'
import { PriorityInbox } from './PriorityInbox'
import { KanbanBoard } from './KanbanBoard'
import { FocusPanel } from './FocusPanel'
import { BlockersPanel } from './BlockersPanel'
import { CalendarCapacityStrip } from './CalendarCapacityStrip'
import { PerformancePanel } from './PerformancePanel'
import { CollaborationPanel } from './CollaborationPanel'
import { WellbeingPanel } from './WellbeingPanel'
import { BottomInsightsRow } from './BottomInsightsRow'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

// ============================================================
// LOADING SKELETON
// ============================================================

function LoadingSkeleton() {
    return (
        <div className="flex-1 overflow-y-auto p-5 space-y-5 animate-pulse">
            {/* Hero band */}
            <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map(i => (
                    <div key={i} className="h-40 rounded-2xl bg-neutral-800" />
                ))}
            </div>
            {/* Inbox */}
            <div className="h-48 rounded-2xl bg-neutral-800" />
            {/* Main workspace */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-64 rounded-2xl bg-neutral-800" />
                <div className="h-64 rounded-2xl bg-neutral-800" />
            </div>
            {/* Bottom panels */}
            <div className="h-40 rounded-2xl bg-neutral-800" />
        </div>
    )
}

// ============================================================
// ERROR STATE
// ============================================================

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
                <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={24} className="text-rose-400" />
                </div>
                <h3 className="text-base font-semibold text-neutral-200 mb-2">Failed to load dashboard</h3>
                <p className="text-sm text-neutral-500 mb-5">{error}</p>
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-sm font-medium text-cyan-400 hover:bg-cyan-500/25 transition-colors"
                >
                    <RefreshCw size={14} />
                    Retry
                </button>
            </div>
        </div>
    )
}

// ============================================================
// ROOT DASHBOARD
// ============================================================

export function EmployeeDashboard() {
    const [activeSection, setActiveSection] = useState<SidebarSection>('dashboard')
    const [searchQuery, setSearchQuery] = useState('')

    const {
        dashboardData,
        tasks,
        loading,
        error,
        bestNextTask,
        atRiskTasks,
        blockedTasks,
        kanbanColumns,
        urgencySortedTasks,
        onAccept,
        onReject,
        onComplete,
        refetch,
    } = useEmployeeDashboard()

    const pendingCount = dashboardData?.taskStats.pending ?? 0

    function scrollTo(anchor: string) {
        const el = document.querySelector(anchor)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-neutral-950 overflow-hidden">
            {/* ── Sidebar ─────────────────────────────────────── */}
            <Sidebar active={activeSection} onNavigate={setActiveSection} />

            {/* ── Main Content ────────────────────────────────── */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* TopBar */}
                <TopBar
                    activeSection={activeSection}
                    pendingCount={pendingCount}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onRefresh={refetch}
                    refreshing={loading}
                />

                {/* Content area */}
                {loading && !dashboardData ? (
                    <LoadingSkeleton />
                ) : error && !dashboardData ? (
                    <ErrorState error={error} onRetry={refetch} />
                ) : dashboardData ? (
                    <main className="flex-1 overflow-y-auto">
                        <div className="max-w-[1600px] mx-auto px-5 py-6 space-y-6">

                            {/* ── Section 3: Hero Decision Band ─── */}
                            <HeroDecisionBand
                                bestNextTask={bestNextTask}
                                atRiskTasks={atRiskTasks}
                                dashboardData={dashboardData}
                                onAccept={onAccept}
                                onScrollTo={scrollTo}
                            />

                            {/* ── Section 4: Priority Inbox ─────── */}
                            <PriorityInbox
                                tasks={urgencySortedTasks}
                                searchQuery={searchQuery}
                                onAccept={onAccept}
                                onReject={onReject}
                                onComplete={onComplete}
                            />

                            {/* ── Section 5 + 6 + 7 + 8: Main Workspace ─── */}
                            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
                                {/* Left: Kanban */}
                                <KanbanBoard
                                    columns={kanbanColumns}
                                    onAccept={onAccept}
                                    onReject={onReject}
                                    onComplete={onComplete}
                                />

                                {/* Right: side panels */}
                                <div className="space-y-5">
                                    {/* Section 6: Focus Panel */}
                                    <FocusPanel bestNextTask={bestNextTask} onAccept={onAccept} />

                                    {/* Section 7: Blockers */}
                                    <BlockersPanel blockedTasks={blockedTasks} onReject={onReject} />

                                    {/* Section 8: Calendar */}
                                    <CalendarCapacityStrip
                                        tasks={tasks}
                                        dashboardData={dashboardData}
                                    />
                                </div>
                            </div>

                            {/* ── Section 9: Performance ────────── */}
                            <PerformancePanel dashboardData={dashboardData} />

                            {/* ── Section 10: Collaboration ─────── */}
                            <CollaborationPanel dashboardData={dashboardData} tasks={tasks} />

                            {/* ── Section 11: Wellbeing ─────────── */}
                            <WellbeingPanel dashboardData={dashboardData} tasks={tasks} />

                            {/* ── Bottom Insights Strip ─────────── */}
                            <BottomInsightsRow dashboardData={dashboardData} tasks={tasks} />

                            {/* Bottom padding */}
                            <div className="h-6" />
                        </div>
                    </main>
                ) : null}
            </div>
        </div>
    )
}
