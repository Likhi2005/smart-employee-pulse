import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    getTaskDetails,
    getTeamTasks,
    getEmployeesForAssignment,
    updateTask,
    approveTask,
    rejectTask,
    type EmployeeOption,
} from '@/services/taskService'
import type { TaskItem, TaskListFilters } from '@/types'
import { TaskListHeader } from './TaskListHeader'
import { TaskFiltersBar } from './TaskFiltersBar'
import { TaskTable } from './TaskTable'
import { TaskDetailsDrawer } from './TaskDetailsDrawer'
import { BulkAssignmentReviewModal } from './BulkAssignmentReviewModal'
import { Sparkles } from 'lucide-react'
import {
    distributeBulkTasks,
    assignBulkTasks,
    deleteTask,
} from '@/services/taskService'

type SavedViewKey = 'all' | 'high-risk' | 'unassigned' | 'due-soon' | 'completed' | 'awaiting-approval'

interface SavedView {
    key: SavedViewKey
    label: string
    patch: Partial<TaskListFilters>
}

const SAVED_VIEWS: SavedView[] = [
    { key: 'all', label: 'All Tasks', patch: {} },
    { key: 'high-risk', label: 'High Risk', patch: { riskLevel: 'high', sortBy: 'updatedAt', sortDir: 'desc' } },
    { key: 'unassigned', label: 'Unassigned', patch: { assignee: 'unassigned', status: 'pending' } },
    { key: 'due-soon', label: 'Due Soon', patch: { sortBy: 'dueDate', sortDir: 'asc' } },
    { key: 'completed', label: 'Completed', patch: { status: 'completed', sortBy: 'updatedAt', sortDir: 'desc' } },
    { key: 'awaiting-approval', label: 'Review Required', patch: { status: 'completed', sortBy: 'updatedAt', sortDir: 'desc' } },
]

const initialFilters: TaskListFilters = {
    search: '',
    status: '',
    priority: '',
    riskLevel: '',
    assignee: '',
    dueDate: '',
    dueDateFrom: '',
    dueDateTo: '',
    sortBy: 'createdAt',
    sortDir: 'desc',
    page: 1,
    limit: 10,
}

function fromSearchParams(searchParams: URLSearchParams): TaskListFilters {
    return {
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || '',
        priority: searchParams.get('priority') || '',
        riskLevel: searchParams.get('riskLevel') || '',
        assignee: searchParams.get('assignee') || '',
        dueDate: searchParams.get('dueDate') || '',
        dueDateFrom: searchParams.get('dueDateFrom') || '',
        dueDateTo: searchParams.get('dueDateTo') || '',
        sortBy: (searchParams.get('sortBy') as TaskListFilters['sortBy']) || 'createdAt',
        sortDir: (searchParams.get('sortDir') as TaskListFilters['sortDir']) || 'desc',
        page: Number(searchParams.get('page') || 1),
        limit: Number(searchParams.get('limit') || 10),
    }
}

function toSearchParams(filters: TaskListFilters) {
    const q = new URLSearchParams()
    if (filters.search) q.set('search', filters.search)
    if (filters.status) q.set('status', filters.status)
    if (filters.priority) q.set('priority', filters.priority)
    if (filters.riskLevel) q.set('riskLevel', filters.riskLevel)
    if (filters.assignee) q.set('assignee', filters.assignee)
    if (filters.dueDate) q.set('dueDate', filters.dueDate)
    if (filters.dueDateFrom) q.set('dueDateFrom', filters.dueDateFrom)
    if (filters.dueDateTo) q.set('dueDateTo', filters.dueDateTo)
    if (filters.sortBy) q.set('sortBy', filters.sortBy)
    if (filters.sortDir) q.set('sortDir', filters.sortDir)
    q.set('page', String(filters.page))
    q.set('limit', String(filters.limit))
    return q
}

export function TaskList() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [savedViewKey, setSavedViewKey] = useState<SavedViewKey>('all')

    const [filters, setFilters] = useState<TaskListFilters>(() => {
        const hasAny = Array.from(searchParams.keys()).length > 0
        return hasAny ? fromSearchParams(searchParams) : initialFilters
    })
    const [draftFilters, setDraftFilters] = useState<TaskListFilters>(() => {
        const hasAny = Array.from(searchParams.keys()).length > 0
        return hasAny ? fromSearchParams(searchParams) : initialFilters
    })

    const [tasks, setTasks] = useState<TaskItem[]>([])
    const [assignees, setAssignees] = useState<EmployeeOption[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [denseMode, setDenseMode] = useState(true)

    const [selectedTaskIdentifier, setSelectedTaskIdentifier] = useState<string | null>(null)
    const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
    const [drawerLoading, setDrawerLoading] = useState(false)
    const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view')

    const [bulkBusy, setBulkBusy] = useState(false)
    const [bulkMessage, setBulkMessage] = useState('')

    const [isBulkReviewOpen, setIsBulkReviewOpen] = useState(false)
    const [bulkMapping, setBulkMapping] = useState<any[]>([])
    const [isBulkAssigning, setIsBulkAssigning] = useState(false)

    const isDrawerOpen = Boolean(selectedTaskIdentifier)
    const selectedCount = selectedRows.length

    const selectedView = useMemo(
        () => SAVED_VIEWS.find((v) => v.key === savedViewKey) || SAVED_VIEWS[0],
        [savedViewKey]
    )

    const loadAssignees = async () => {
        try {
            const rows = await getEmployeesForAssignment()
            setAssignees(rows)
        } catch {
            setAssignees([])
        }
    }

    const loadTasks = async (next = filters) => {
        setLoading(true)
        setError('')
        try {
            const response = await getTeamTasks({
                page: next.page,
                limit: next.limit,
                search: next.search,
                status: next.status || undefined,
                priority: next.priority || undefined,
                riskLevel: next.riskLevel || undefined,
                employeeId: next.assignee === 'unassigned' ? undefined : next.assignee || undefined,
                dueDate: next.dueDate || undefined,
                dueDateFrom: next.dueDateFrom || undefined,
                dueDateTo: next.dueDateTo || undefined,
                sortBy: next.sortBy,
                sortDir: next.sortDir,
            })

            let data = response.data || []
            if (next.assignee === 'unassigned') {
                data = data.filter((task) => !task.assignedTo)
            }

            setTasks(data)
            setTotalPages(response.meta.totalPages || 1)
            setTotalItems(response.meta.total || 0)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load tasks')
            setTasks([])
            setTotalPages(1)
            setTotalItems(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAssignees()
    }, [])

    useEffect(() => {
        loadTasks(filters)
        setSearchParams(toSearchParams(filters))
    }, [filters])

    const applyFilters = () => {
        const next = { ...draftFilters, page: 1 }
        setFilters(next)
        setSelectedRows([])
    }

    const resetFilters = () => {
        setDraftFilters(initialFilters)
        setFilters(initialFilters)
        setSavedViewKey('all')
        setSelectedRows([])
        setBulkMessage('')
    }

    const applySavedView = (nextKey: SavedViewKey) => {
        setSavedViewKey(nextKey)
        const view = SAVED_VIEWS.find((v) => v.key === nextKey)
        if (!view) return
        const merged = { ...initialFilters, ...view.patch, page: 1 }
        setDraftFilters(merged)
        setFilters(merged)
        setSelectedRows([])
        setBulkMessage('')
    }

    const openTask = async (taskIdentifier: string, mode: 'view' | 'edit' = 'view') => {
        setSelectedTaskIdentifier(taskIdentifier)
        setDrawerMode(mode)
        setDrawerLoading(true)
        try {
            const task = await getTaskDetails(taskIdentifier)
            setSelectedTask(task)
        } catch {
            setSelectedTask(null)
        } finally {
            setDrawerLoading(false)
        }
    }

    const closeDrawer = () => {
        setSelectedTaskIdentifier(null)
        setSelectedTask(null)
        setDrawerMode('view')
    }

    const handleApproveTask = async (taskId: string, notes?: string) => {
        try {
            await approveTask(taskId, notes)
            setBulkMessage('Task approved successfully')
            closeDrawer()
            await loadTasks(filters)
        } catch (err: any) {
            setBulkMessage(err?.response?.data?.message || 'Failed to approve task')
        }
    }

    const handleRejectTask = async (taskId: string, reason?: string) => {
        try {
            await rejectTask(taskId, reason)
            setBulkMessage('Task rejected successfully')
            closeDrawer()
            await loadTasks(filters)
        } catch (err: any) {
            setBulkMessage(err?.response?.data?.message || 'Failed to reject task')
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return
        try {
            await deleteTask(taskId)
            setBulkMessage('Task deleted successfully')
            await loadTasks(filters)
        } catch (err: any) {
            setBulkMessage(err?.response?.data?.message || 'Failed to delete task')
        }
    }

    const handleEditTask = (task: TaskItem) => {
        openTask(task.id || task._id, 'edit')
    }

    const handleUpdateTask = async (taskId: string, payload: any) => {
        try {
            await updateTask(taskId, payload)
            setBulkMessage('Task updated successfully')
            await loadTasks(filters)
        } catch (err: any) {
            setBulkMessage(err?.response?.data?.message || 'Failed to update task')
        }
    }

    const toggleRow = (taskMongoId: string) => {
        setSelectedRows((prev) =>
            prev.includes(taskMongoId) ? prev.filter((id) => id !== taskMongoId) : [...prev, taskMongoId]
        )
    }

    const toggleAll = () => {
        if (selectedRows.length === tasks.length) {
            setSelectedRows([])
            return
        }
        setSelectedRows(tasks.map((t) => t._id))
    }

    const applyBulkPriority = async (priority: 'high' | 'medium' | 'low') => {
        if (!selectedRows.length) return
        setBulkBusy(true)
        setBulkMessage('')
        try {
            await Promise.all(selectedRows.map((id) => updateTask(id, { priority })))
            setBulkMessage(`Updated priority to ${priority} for ${selectedRows.length} tasks.`)
            setSelectedRows([])
            await loadTasks(filters)
        } catch (err: any) {
            setBulkMessage(err?.response?.data?.message || 'Bulk priority update failed.')
        } finally {
            setBulkBusy(false)
        }
    }

    const applyBulkStatus = async (status: 'pending' | 'in-progress' | 'completed') => {
        if (!selectedRows.length) return
        setBulkBusy(true)
        setBulkMessage('')
        try {
            await Promise.all(selectedRows.map((id) => updateTask(id, { status })))
            setBulkMessage(`Updated status to ${status} for ${selectedRows.length} tasks.`)
            setSelectedRows([])
            await loadTasks(filters)
        } catch (err: any) {
            setBulkMessage(err?.response?.data?.message || 'Bulk status update failed.')
        } finally {
            setBulkBusy(false)
        }
    }

    const handleBulkDistribute = async () => {
        if (!selectedRows.length) return
        setBulkBusy(true)
        setBulkMessage('')
        try {
            const mapping = await distributeBulkTasks(selectedRows)
            setBulkMapping(mapping)
            setIsBulkReviewOpen(true)
        } catch (err: any) {
            setBulkMessage(err?.response?.data?.message || 'AI distribution failed.')
        } finally {
            setBulkBusy(false)
        }
    }

    const handleConfirmBulkAssign = async (assignments: Array<{ taskId: string; employeeId: string }>) => {
        setIsBulkAssigning(true)
        try {
            await assignBulkTasks(assignments)
            setBulkMessage(`Successfully assigned ${assignments.length} tasks via AI.`)
            setIsBulkReviewOpen(false)
            setSelectedRows([])
            await loadTasks(filters)
        } catch (err: any) {
            setBulkMessage(err?.response?.data?.message || 'Final assignment failed.')
        } finally {
            setIsBulkAssigning(false)
        }
    }

    return (
        <div
            className={
                isDrawerOpen
                    ? 'grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]'
                    : 'grid grid-cols-1 gap-4'
            }
        >
            <div className="min-w-0">
                <section className="rounded-2xl border border-neutral-800 bg-neutral-950">
                    <TaskListHeader
                        denseMode={denseMode}
                        onToggleDense={() => setDenseMode((v) => !v)}
                        selectedCount={selectedCount}
                        savedViews={SAVED_VIEWS.map((v) => ({ key: v.key, label: v.label }))}
                        activeSavedView={selectedView.key}
                        onSelectSavedView={(k) => applySavedView(k as SavedViewKey)}
                    />

                    <TaskFiltersBar
                        value={draftFilters}
                        onChange={setDraftFilters}
                        onApply={applyFilters}
                        onReset={resetFilters}
                        assigneeOptions={assignees}
                    />

                    {selectedCount > 0 && (
                        <div className="mx-4 mb-4 rounded-xl border border-neutral-800 bg-neutral-900/70 p-3 sm:mx-5">
                            <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                                <p className="text-sm text-neutral-300">
                                    {selectedCount} tasks selected
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={bulkBusy}
                                        onClick={() => applyBulkPriority('high')}
                                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
                                    >
                                        Priority High
                                    </button>
                                    <button
                                        type="button"
                                        disabled={bulkBusy}
                                        onClick={() => applyBulkPriority('medium')}
                                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
                                    >
                                        Priority Medium
                                    </button>
                                    <button
                                        type="button"
                                        disabled={bulkBusy}
                                        onClick={() => applyBulkStatus('completed')}
                                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
                                    >
                                        Mark Completed
                                    </button>
                                    <button
                                        type="button"
                                        disabled={bulkBusy}
                                        onClick={handleBulkDistribute}
                                        className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-500 hover:bg-amber-500 hover:text-neutral-950 disabled:opacity-50 transition-colors"
                                    >
                                        <Sparkles size={14} />
                                        AI Smart Distribute
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRows([])}
                                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                            {bulkMessage && (
                                <p className="mt-2 text-xs text-neutral-400">{bulkMessage}</p>
                            )}
                        </div>
                    )}

                    <TaskTable
                        tasks={tasks}
                        loading={loading}
                        error={error}
                        denseMode={denseMode}
                        isDrawerOpen={isDrawerOpen}
                        selectedRows={selectedRows}
                        onToggleAll={toggleAll}
                        onToggleRow={toggleRow}
                        onOpenRow={openTask}
                        onEditRow={handleEditTask}
                        onDeleteRow={handleDeleteTask}
                        onApproveRow={handleApproveTask}
                        onRejectRow={handleRejectTask}
                        page={filters.page}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        onPrevPage={() =>
                            setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                        }
                        onNextPage={() =>
                            setFilters((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))
                        }
                    />
                </section>
            </div>

            <TaskDetailsDrawer
                open={isDrawerOpen}
                loading={drawerLoading}
                task={selectedTask}
                onClose={closeDrawer}
                onApprove={handleApproveTask}
                onReject={handleRejectTask}
                onUpdate={handleUpdateTask}
                initialMode={drawerMode}
            />

            <BulkAssignmentReviewModal
                isOpen={isBulkReviewOpen}
                onClose={() => setIsBulkReviewOpen(false)}
                mapping={bulkMapping}
                employees={assignees}
                onConfirm={handleConfirmBulkAssign}
                isSubmitting={isBulkAssigning}
            />
        </div>
    )
}