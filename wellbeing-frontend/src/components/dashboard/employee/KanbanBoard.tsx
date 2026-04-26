import React from 'react'
import { Columns2 } from 'lucide-react'
import type { TaskItem } from '@/types'
import type { KanbanColumns } from '@/hooks/useEmployeeDashboard'
import { TaskCard } from './TaskCard'

// ============================================================
// COLUMN CONFIG
// ============================================================

interface ColumnDef {
    key: keyof KanbanColumns
    label: string
    accent: string
    headerBg: string
    countBg: string
    emptyMsg: string
}

const COLUMNS: ColumnDef[] = [
    {
        key: 'pending',
        label: 'Pending',
        accent: 'border-t-blue-500',
        headerBg: 'text-blue-400',
        countBg: 'bg-blue-500/20 text-blue-400',
        emptyMsg: 'No pending tasks',
    },
    {
        key: 'inProgress',
        label: 'In Progress',
        accent: 'border-t-cyan-500',
        headerBg: 'text-cyan-400',
        countBg: 'bg-cyan-500/20 text-cyan-400',
        emptyMsg: 'Nothing in progress',
    },
    {
        key: 'reviewPending',
        label: 'Review Pending',
        accent: 'border-t-amber-500',
        headerBg: 'text-amber-400',
        countBg: 'bg-amber-500/20 text-amber-400',
        emptyMsg: 'No tasks in review',
    },
    {
        key: 'done',
        label: 'Done',
        accent: 'border-t-emerald-500',
        headerBg: 'text-emerald-400',
        countBg: 'bg-emerald-500/20 text-emerald-400',
        emptyMsg: 'No completed tasks',
    },
]

// ============================================================
// PROPS
// ============================================================

interface KanbanBoardProps {
    columns: KanbanColumns
    onAccept: (id: string) => Promise<void>
    onReject: (id: string) => Promise<void>
    onComplete: (id: string) => Promise<void>
    onOpenDetails?: (task: TaskItem) => void
}

// ============================================================
// COMPONENT
// ============================================================

export function KanbanBoard({ columns, onAccept, onReject, onComplete, onOpenDetails }: KanbanBoardProps) {
    return (
        <div id="kanban-board" className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-neutral-800">
                <Columns2 size={16} className="text-cyan-400" />
                <h2 className="text-sm font-semibold text-neutral-100">My Work Pipeline</h2>
                <span className="text-xs text-neutral-500 ml-1">
                    · {Object.values(columns).flat().length} tasks total
                </span>
            </div>

            {/* Columns */}
            <div className="grid grid-cols-2 xl:grid-cols-4 min-h-[400px]">
                {COLUMNS.map((col, i) => {
                    const tasks: TaskItem[] = columns[col.key] || []
                    return (
                        <div
                            key={col.key}
                            className={[
                                'flex flex-col border-t-2',
                                col.accent,
                                i < COLUMNS.length - 1 ? 'border-r border-neutral-800/70' : '',
                            ].join(' ')}
                        >
                            {/* Column header */}
                            <div className="flex items-center justify-between px-3 py-3 bg-neutral-900/60 border-b border-neutral-800/50">
                                <span className={`text-xs font-semibold uppercase tracking-wider ${col.headerBg}`}>
                                    {col.label}
                                </span>
                                <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold ${col.countBg}`}>
                                    {tasks.length}
                                </span>
                            </div>

                            {/* Tasks */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[480px]">
                                {tasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-32 text-center">
                                        <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-2">
                                            <span className="text-neutral-600 text-base">·</span>
                                        </div>
                                        <p className="text-xs text-neutral-600">{col.emptyMsg}</p>
                                    </div>
                                ) : (
                                    tasks.map(task => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            compact={true}
                                            showActions={col.key !== 'done'}
                                            onAccept={col.key === 'pending' ? onAccept : undefined}
                                            onReject={col.key === 'pending' ? onReject : undefined}
                                            onComplete={col.key === 'inProgress' ? onComplete : undefined}
                                            onOpenDetails={onOpenDetails}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
