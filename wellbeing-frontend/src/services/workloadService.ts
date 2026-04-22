import api from '@/services/api'

// ============================================================
// TYPES
// ============================================================

export interface WorkloadSummary {
    totalEmployees: number
    totalTasks: number
    activeTasks: number
    completedTasks: number
    rejectedTasks: number
    avgWorkload: number
    maxWorkload: number
    minWorkload: number
    overloadedEmployees: number
    healthyEmployees: number
    completionRate: number
    workloadDistribution: {
        low: number
        medium: number
        high: number
    }
}

export interface TeamMember {
    id: string
    name: string
    email: string
    workload: number
    performanceScore: number
    status: 'critical' | 'elevated' | 'healthy'
}

export interface Team {
    name: string
    employees: TeamMember[]
    totalWorkload: number
    avgWorkload: number
    maxWorkload: number
    employeeCount: number
    overloaded: number
    status: 'critical' | 'elevated' | 'healthy'
}

export interface EmployeeWorkloadDetail {
    id: string
    name: string
    email: string
    department: string
    workload: number
    performanceScore: number
}

export interface Task {
    _id: string
    title: string
    priority: 'low' | 'medium' | 'high'
    status: string
    effort: number
    dueDate?: string
    completedAt?: string
}

export interface EmployeeDetails {
    employee: EmployeeWorkloadDetail
    tasks: Task[]
    taskBreakdown: Record<string, number>
    priorityDistribution: Record<string, number>
    totalTasks: number
    avgEffort: number
}

export interface Bottleneck {
    name: string
    workload: number
    taskCount: number
    completed: number
}

export interface WorkloadAnalytics {
    taskStates: Record<string, number>
    priorityBreakdown: Record<string, number>
    bottlenecks: Bottleneck[]
    employeeTaskCounts: any[]
    totalEffort: number
}

export interface TrendData {
    date: string
    assigned: number
    completed: number
    activeEmployees: number
}

// ============================================================
// API CALLS
// ============================================================

export async function getWorkloadSummary(): Promise<WorkloadSummary> {
    const res = await api.get('/workload/summary')
    return res.data.summary
}

export async function getWorkloadByTeam(): Promise<Team[]> {
    const res = await api.get('/workload/by-team')
    return res.data.teams
}

export async function getWorkloadAnalytics(): Promise<WorkloadAnalytics> {
    const res = await api.get('/workload/analytics')
    return res.data.analytics
}

export async function getEmployeeWorkloadDetails(employeeId: string): Promise<EmployeeDetails> {
    const res = await api.get(`/workload/employee/${employeeId}`)
    return res.data.details
}

export async function getWorkloadTrends(days: number = 30): Promise<TrendData[]> {
    const res = await api.get(`/workload/trends?days=${days}`)
    return res.data.trends
}
