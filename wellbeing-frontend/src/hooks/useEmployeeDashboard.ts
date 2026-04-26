import { useState, useEffect, useCallback } from 'react'
import {
    getEmployeeDashboard,
    getMyTasks,
    acceptTask,
    rejectTask,
    completeTask,
    type EmployeeDashboardData,
} from '@/services/dashboardService'
import type { TaskItem } from '@/types'

// ============================================================
// DERIVED TYPES
// ============================================================

export interface KanbanColumns {
    pending: TaskItem[]
    inProgress: TaskItem[]
    reviewPending: TaskItem[]
    done: TaskItem[]
}

export interface UseEmployeeDashboardReturn {
    dashboardData: EmployeeDashboardData | null
    tasks: TaskItem[]
    loading: boolean
    error: string | null
    // Derived
    bestNextTask: TaskItem | null
    atRiskTasks: TaskItem[]
    blockedTasks: TaskItem[]
    kanbanColumns: KanbanColumns
    urgencySortedTasks: TaskItem[]
    // Actions
    onAccept: (taskId: string) => Promise<void>
    onReject: (taskId: string, reason?: string) => Promise<void>
    onComplete: (taskId: string) => Promise<void>
    refetch: () => Promise<void>
}

// ============================================================
// HELPERS
// ============================================================

const PRIORITY_WEIGHT: Record<string, number> = { high: 3, medium: 2, low: 1 }

function getDueDateScore(dueDate?: string): number {
    if (!dueDate) return 0
    const diff = (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60) // hours
    if (diff < 0) return 3    // overdue
    if (diff < 24) return 2   // due in < 24h
    if (diff < 72) return 1   // due in < 72h
    return 0
}

function getRiskScore(riskLevel?: string): number {
    if (riskLevel === 'high') return 2
    if (riskLevel === 'medium') return 1
    return 0
}

function computeUrgencyScore(task: TaskItem): number {
    return (
        (PRIORITY_WEIGHT[task.priority] || 1) +
        getDueDateScore(task.dueDate) +
        getRiskScore(task.riskLevel)
    )
}

function isAtRisk(task: TaskItem): boolean {
    if (task.riskLevel === 'high') return true
    if (!task.dueDate) return false
    const hoursLeft = (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60)
    return hoursLeft < 48
}

// ============================================================
// HOOK
// ============================================================

export function useEmployeeDashboard(): UseEmployeeDashboardReturn {
    const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null)
    const [tasks, setTasks] = useState<TaskItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAll = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [dashboard, myTasks] = await Promise.all([
                getEmployeeDashboard(),
                getMyTasks(),
            ])
            setDashboardData(dashboard)
            setTasks(myTasks)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    // ── Derived values ────────────────────────────────────────

    const activeTasks = tasks.filter(t => t.status !== 'rejected')

    const urgencySortedTasks = [...activeTasks].sort(
        (a, b) => computeUrgencyScore(b) - computeUrgencyScore(a)
    )

    // Best next task: highest-priority pending task
    const bestNextTask = urgencySortedTasks.find(t => t.status === 'pending') ?? null

    const atRiskTasks = activeTasks.filter(isAtRisk)

    const blockedTasks = activeTasks.filter(
        t => t.riskLevel === 'high' || getDueDateScore(t.dueDate) >= 2
    )

    const kanbanColumns: KanbanColumns = {
        pending: tasks.filter(t => t.status === 'pending'),
        inProgress: tasks.filter(t => t.status === 'in-progress'),
        reviewPending: tasks.filter(t => (t as any).taskState === 'REVIEW_PENDING' || t.status === 'completed'),
        done: tasks.filter(t => t.status === 'completed' && (t as any).taskState === 'APPROVED'),
    }

    // ── Actions ───────────────────────────────────────────────

    const onAccept = useCallback(async (taskId: string) => {
        // Optimistic update
        setTasks(prev =>
            prev.map(t => t._id === taskId ? { ...t, status: 'in-progress' as any, taskState: 'IN_PROGRESS' as any } : t)
        )
        try {
            await acceptTask(taskId)
            await fetchAll()
        } catch (err) {
            await fetchAll() // rollback
            throw err
        }
    }, [fetchAll])

    const onReject = useCallback(async (taskId: string, reason?: string) => {
        setTasks(prev =>
            prev.map(t => t._id === taskId ? { ...t, status: 'rejected' as any } : t)
        )
        try {
            await rejectTask(taskId, reason)
            await fetchAll()
        } catch (err) {
            await fetchAll()
            throw err
        }
    }, [fetchAll])

    const onComplete = useCallback(async (taskId: string) => {
        setTasks(prev =>
            prev.map(t => t._id === taskId ? { ...t, status: 'completed' as any, taskState: 'COMPLETED' as any } : t)
        )
        try {
            await completeTask(taskId)
            await fetchAll()
        } catch (err) {
            await fetchAll()
            throw err
        }
    }, [fetchAll])

    return {
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
        refetch: fetchAll,
    }
}
