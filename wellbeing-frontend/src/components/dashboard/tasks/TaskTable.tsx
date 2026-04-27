import { Eye, Loader2, PencilLine, Trash2, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react'
import type { TaskItem } from '@/types'

interface TaskTableProps {
    tasks: TaskItem[]
    loading: boolean
    error: string
    denseMode: boolean
    isDrawerOpen: boolean
    selectedRows: string[]
    onToggleAll: () => void
    onToggleRow: (taskId: string) => void
    onOpenRow: (taskIdentifier: string) => void
    onEditRow?: (task: TaskItem) => void
    onDeleteRow?: (taskId: string) => void
    onApproveRow?: (taskId: string) => void
    onRejectRow?: (taskId: string) => void
    page: number
    totalPages: number
    totalItems: number
    onPrevPage: () => void
    onNextPage: () => void
}

function taskDisplayId(task: TaskItem) {
    return task.id || `TASK-${task._id.slice(-6).toUpperCase()}`
}

function statusClass(status: string) {
    if (status === 'in-progress') return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    if (status === 'completed') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    if (status === 'rejected') return 'bg-red-500/15 text-red-300 border-red-500/30'
    if (status === 'accepted') return 'bg-sky-500/15 text-sky-300 border-sky-500/30'
    return 'bg-neutral-800 text-neutral-300 border-neutral-700'
}

function priorityClass(priority: string) {
    if (priority === 'high') return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    if (priority === 'medium') return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
    return 'bg-neutral-800 text-neutral-300 border-neutral-700'
}

function riskClass(riskLevel?: string) {
    if (riskLevel === 'high') return 'bg-red-500/15 text-red-300 border-red-500/30'
    if (riskLevel === 'medium') return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
}

function formatDate(date?: string) {
    if (!date) return 'No due date'
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    })
}

function assigneeName(task: TaskItem) {
    if (typeof task.assignedTo === 'object' && task.assignedTo) return task.assignedTo.fullName
    return 'Unassigned'
}

export function TaskTable({
    tasks,
    loading,
    error,
    denseMode,
    isDrawerOpen,
    selectedRows,
    onToggleAll,
    onToggleRow,
    onOpenRow,
    onEditRow,
    onDeleteRow,
    onApproveRow,
    onRejectRow,
    page,
    totalPages,
    totalItems,
    onPrevPage,
    onNextPage,
}: TaskTableProps) {
    const rowPadding = denseMode ? 'py-2' : 'py-3.5'
    const tableMinWidth = isDrawerOpen ? 'min-w-[980px]' : 'min-w-[1180px]'
    const showEffort = !isDrawerOpen
    const colCount = showEffort ? 9 : 8

    return (
        <>
            <div className="overflow-x-auto">
                <table className={`${tableMinWidth} w-full border-separate border-spacing-0`}>
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-neutral-900/95">
                            <th className="w-10 border-b border-neutral-800 px-3 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={tasks.length > 0 && selectedRows.length === tasks.length}
                                    onChange={onToggleAll}
                                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 accent-amber-500"
                                />
                            </th>
                            <th className="border-b border-neutral-800 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                Task
                            </th>
                            <th className="border-b border-neutral-800 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                Public ID
                            </th>
                            <th className="border-b border-neutral-800 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                Assignee
                            </th>
                            <th className="border-b border-neutral-800 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                Priority
                            </th>
                            <th className="border-b border-neutral-800 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                Status
                            </th>
                            <th className="border-b border-neutral-800 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                Due / Risk
                            </th>
                            {showEffort && (
                                <th className="border-b border-neutral-800 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                    Effort
                                </th>
                            )}
                            <th className="border-b border-neutral-800 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={colCount} className="px-4 py-10 text-center text-neutral-400">
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Loading tasks...
                                    </span>
                                </td>
                            </tr>
                        )}

                        {!loading && error && (
                            <tr>
                                <td colSpan={colCount} className="px-4 py-10 text-center text-red-300">
                                    {error}
                                </td>
                            </tr>
                        )}

                        {!loading && !error && tasks.length === 0 && (
                            <tr>
                                <td colSpan={colCount} className="px-4 py-12 text-center text-neutral-400">
                                    No tasks found for selected filters.
                                </td>
                            </tr>
                        )}

                        {!loading && !error && tasks.map((task) => {
                                const identifier = task.id || task._id
                                const isRestricted = ['in-progress', 'completed', 'accepted'].includes(task.status) || (task as any).taskState === 'APPROVED'
                                return (
                                    <tr
                                        key={task._id}
                                        onClick={() => onOpenRow(identifier)}
                                        className="cursor-pointer border-b border-neutral-900/60 hover:bg-neutral-900/60"
                                    >
                                        <td className={`border-b border-neutral-800 px-3 ${rowPadding}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(task._id)}
                                                onChange={(e) => {
                                                    e.stopPropagation()
                                                    onToggleRow(task._id)
                                                }}
                                                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 accent-amber-500"
                                            />
                                        </td>

                                        <td className={`border-b border-neutral-800 px-3 ${rowPadding} max-w-md overflow-hidden`}>
                                            <div className="font-semibold text-neutral-50 truncate">{task.title}</div>
                                            {task.description && (
                                                <div className="mt-0.5 line-clamp-2 text-[11px] text-neutral-500 break-words">
                                                    {task.description}
                                                </div>
                                            )}
                                        </td>

                                        <td className={`border-b border-neutral-800 px-3 ${rowPadding}`}>
                                            <span className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-200">
                                                {taskDisplayId(task)}
                                            </span>
                                        </td>

                                        <td className={`border-b border-neutral-800 px-3 ${rowPadding}`}>
                                            <span className="text-sm text-neutral-200">{assigneeName(task)}</span>
                                        </td>

                                        <td className={`border-b border-neutral-800 px-3 ${rowPadding}`}>
                                            <span
                                                className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${priorityClass(task.priority)}`}
                                            >
                                                {task.priority}
                                            </span>
                                        </td>

                                        <td className={`border-b border-neutral-800 px-3 ${rowPadding}`}>
                                            <span
                                                className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClass(task.status)}`}
                                            >
                                                {task.status}
                                            </span>
                                        </td>

                                        <td className={`border-b border-neutral-800 px-3 ${rowPadding}`}>
                                            <div className="text-sm text-neutral-200">{formatDate(task.dueDate)}</div>
                                            <div className="mt-1">
                                                <span
                                                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${riskClass(task.riskLevel)}`}
                                                >
                                                    {task.riskLevel || 'low'} risk
                                                </span>
                                            </div>
                                        </td>

                                        {showEffort && (
                                            <td className={`border-b border-neutral-800 px-3 ${rowPadding}`}>
                                                <span className="text-sm text-neutral-200">{task.effort} hrs</span>
                                            </td>
                                        )}

                                        <td className={`border-b border-neutral-800 px-3 ${rowPadding}`}>
                                            <div className="flex items-center gap-0.5 text-neutral-400">
                                                <button
                                                    type="button"
                                                    title="View Details"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onOpenRow(identifier)
                                                    }}
                                                    className="rounded p-1.5 hover:bg-neutral-800 hover:text-neutral-100"
                                                >
                                                    <Eye size={14} />
                                                </button>

                                                {task.status === 'completed' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            title="Approve Task"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onApproveRow?.(task._id)
                                                            }}
                                                            className="rounded p-1.5 hover:bg-emerald-500/20 hover:text-emerald-400 text-emerald-500/70 transition-colors"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title="Reject Task"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onRejectRow?.(task._id)
                                                            }}
                                                            className="rounded p-1.5 hover:bg-red-500/20 hover:text-red-400 text-red-500/70 transition-colors"
                                                        >
                                                            <AlertCircle size={14} />
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    type="button"
                                                    title={isRestricted ? "Cannot edit active/completed task" : "Edit Task"}
                                                    disabled={isRestricted}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onEditRow?.(task)
                                                    }}
                                                    className="rounded p-1.5 hover:bg-neutral-800 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <PencilLine size={14} />
                                                </button>
                                                
                                                <button
                                                    type="button"
                                                    title={isRestricted ? "Cannot delete active/completed task" : "Delete Task"}
                                                    disabled={isRestricted}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onDeleteRow?.(task._id)
                                                    }}
                                                    className="rounded p-1.5 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-neutral-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="text-sm text-neutral-400">
                    Showing {tasks.length} of {totalItems} tasks
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onPrevPage}
                        disabled={page === 1}
                        className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
                        {page} / {totalPages}
                    </div>
                    <button
                        type="button"
                        onClick={onNextPage}
                        disabled={page === totalPages}
                        className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    )
}