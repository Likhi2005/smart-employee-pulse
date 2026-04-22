import api from '@/services/api'
import type { TaskItem } from '@/types'

// ============================================================
// TYPES
// ============================================================

export interface EmployeeProfile {
    fullName: string
    email: string
    department?: string
    currentWorkload: number
    workloadStatus: 'normal' | 'overloaded'
}

export interface TaskStats {
    total: number
    pending: number
    accepted: number
    completed: number
    rejected: number
}

export interface Performance {
    points: number
    tasksCompleted: number
    gamePoints: number
    rank: number
}

export interface LeaderboardEntry {
    rank: number
    name: string
    points: number
    tasksCompleted: number
}

export interface EmployeeDashboardData {
    profile: EmployeeProfile
    taskStats: TaskStats
    performance: Performance
    activeTasks: TaskItem[]
    leaderboard: LeaderboardEntry[]
}

export interface EmployeeDashboardResponse {
    message: string
    dashboard: EmployeeDashboardData
}

export interface MyTasksResponse {
    message: string
    tasks: TaskItem[]
    count: number
}

// ============================================================
// API CALLS
// ============================================================

export async function getEmployeeDashboard(): Promise<EmployeeDashboardData> {
    const res = await api.get<EmployeeDashboardResponse>('/dashboard/employee')
    return res.data.dashboard
}

export async function getMyTasks(status?: string): Promise<TaskItem[]> {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    const res = await api.get<MyTasksResponse>(`/tasks/my-tasks?${params.toString()}`)
    return res.data.tasks || []
}

export async function acceptTask(taskId: string): Promise<void> {
    await api.post('/tasks/accept', { taskId })
}

export async function rejectTask(taskId: string, reason?: string): Promise<void> {
    await api.post('/tasks/reject', { taskId, reason: reason || 'Rejected by employee' })
}

export async function completeTask(taskId: string): Promise<void> {
    await api.post('/tasks/complete', { taskId })
}



// ============================================================
// MANAGER DASHBOARD
// ============================================================

export interface ManagerDashboard {
    teamStats: {
        totalEmployees: number
        avgWorkload: number
        maxWorkload: number
        minWorkload: number
        workloadImbalance: number
    }
    taskStats: {
        total: number
        pending: number
        accepted: number
        completed: number
        rejected: number
    }
    teamWorkload: Array<{
        _id: string
        fullName: string
        email: string
        currentWorkload: number
        status: string
    }>
    recentTasks: TaskItem[]
    alerts: {
        overloadedEmployee: { name: string; workload: number; message: string } | null
        underutilizedEmployee: { name: string; workload: number; message: string } | null
    }
}

export interface ManagerDashboardResponse {
    message: string
    dashboard: ManagerDashboard
}

export async function getManagerDashboard(): Promise<ManagerDashboard> {
    const res = await api.get<ManagerDashboardResponse>('/dashboard/manager')
    return res.data.dashboard
}
