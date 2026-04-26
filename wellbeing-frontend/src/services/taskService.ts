import api from '@/services/api'

import type { CandidateRanking, PolicyValidationResult } from '@/types'

export async function validateTaskPolicy(payload: {
    title?: string
    description?: string
    effort?: number
    priority?: string
    dueDate?: string
    isMandatory?: boolean
}) {
    const response = await api.post('/tasks/policy/validate', payload)
    return response.data?.result as PolicyValidationResult
}

export async function rankTaskCandidates(payload: {
    taskId?: string
    effort?: number
    dueDate?: string
    isMandatory?: boolean
    requiredSkills?: string[]
}) {
    const response = await api.post('/tasks/rank-candidates', payload)
    return {
        rankedCandidates: (response.data?.rankedCandidates || []) as CandidateRanking[],
        topCandidate: response.data?.topCandidate as CandidateRanking | null,
        rejectedCandidates: response.data?.rejectedCandidates || [],
        rankingState: response.data?.rankingState || null,
    }
}

export async function createTaskFromTemplate(payload: {
    templateId: string
    title?: string
    description?: string
    effort?: number
    priority?: TaskPriority
    dueDate?: string
    isMandatory?: boolean
}) {
    const response = await api.post('/tasks/create-from-template', payload)
    return response.data
}
import type {
    TaskItem,
    TaskListResponse,
    TaskHistoryItem,
    TaskPriority,
    TaskStatus,
    TaskRiskLevel,
} from '@/types'

export interface TaskQueryParams {
    page?: number
    limit?: number
    search?: string
    status?: string
    priority?: string
    riskLevel?: string
    employeeId?: string
    id?: string
    dueDate?: string
    dueDateFrom?: string
    dueDateTo?: string
    sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'effort' | 'riskLevel' | 'status' | 'id'
    sortDir?: 'asc' | 'desc'
}

export interface EmployeeOption {
    _id: string
    fullName: string
    email: string
    currentWorkload: number
    department?: string
}

export interface CreateTaskPayload {
    title: string
    description?: string
    effort: number
    priority?: TaskPriority
    dueDate?: string
    isMandatory?: boolean
}

export interface AssignTaskPayload {
    taskId: string
    employeeId?: string
    assignmentMode?: 'manual' | 'rule-based' | 'ai'
    requiredSkills?: string[]
    useAIAssignment?: boolean
    useRuleBasedAssignment?: boolean
}

export interface UpdateTaskPayload {
    title?: string
    description?: string
    effort?: number
    priority?: TaskPriority
    status?: TaskStatus
    dueDate?: string
    assignedTo?: string | null
    riskLevel?: TaskRiskLevel
    isMandatory?: boolean
}

export interface TaskTemplateItem {
    id?: string
    _id: string
    name: string
    title: string
    description: string
    defaultPriority: TaskPriority
    defaultEffort: number
    defaultIsMandatory: boolean
    department?: string
    skillsRequired?: string[]
    tags?: string[]
    isActive: boolean
    createdAt: string
    createdBy?: { _id: string; fullName: string }
}

export interface CreateTaskTemplatePayload {
    name: string
    title: string
    description?: string
    defaultPriority?: TaskPriority
    defaultEffort?: number
    defaultIsMandatory?: boolean
    department?: string
    skillsRequired?: string[]
    tags?: string[]
}

export interface UpdateTaskTemplatePayload {
    name?: string
    title?: string
    description?: string
    defaultPriority?: TaskPriority
    defaultEffort?: number
    defaultIsMandatory?: boolean
    department?: string
    skillsRequired?: string[]
    tags?: string[]
    isActive?: boolean
}

export async function getTeamTasks(params: TaskQueryParams = {}): Promise<TaskListResponse> {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.set('page', String(params.page))
    if (params.limit) searchParams.set('limit', String(params.limit))
    if (params.search?.trim()) searchParams.set('search', params.search.trim())
    if (params.status) searchParams.set('status', params.status)
    if (params.priority) searchParams.set('priority', params.priority)
    if (params.riskLevel) searchParams.set('riskLevel', params.riskLevel)
    if (params.employeeId) searchParams.set('employeeId', params.employeeId)
    if (params.id) searchParams.set('id', params.id)
    if (params.dueDate) searchParams.set('dueDate', params.dueDate)
    if (params.dueDateFrom) searchParams.set('dueDateFrom', params.dueDateFrom)
    if (params.dueDateTo) searchParams.set('dueDateTo', params.dueDateTo)
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.sortDir) searchParams.set('sortDir', params.sortDir)

    const response = await api.get(`/tasks/team-tasks?${searchParams.toString()}`)
    const payload = response.data || {}

    return {
        data: payload.tasks || [],
        meta: {
            page: Number(payload.meta?.page || 1),
            limit: Number(payload.meta?.limit || 10),
            total: Number(payload.meta?.total || 0),
            totalPages: Number(payload.meta?.totalPages || 1),
        },
    }
}

export async function getTaskDetails(taskId: string): Promise<TaskItem> {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data?.task as TaskItem
}

export async function getTaskHistory(taskId: string): Promise<TaskHistoryItem[]> {
    const response = await api.get(`/tasks/${taskId}/history`)
    return (response.data?.history || []) as TaskHistoryItem[]
}

export async function getTaskHistoryFeed(params: {
    page?: number
    limit?: number
    action?: string
    actorId?: string
    taskId?: string
    sortBy?: string
    sortDir?: 'asc' | 'desc'
} = {}) {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    if (params.action) q.set('action', params.action)
    if (params.actorId) q.set('actorId', params.actorId)
    if (params.taskId) q.set('taskId', params.taskId)
    if (params.sortBy) q.set('sortBy', params.sortBy)
    if (params.sortDir) q.set('sortDir', params.sortDir)

    const response = await api.get(`/tasks/history?${q.toString()}`)
    return {
        history: response.data?.history || [],
        meta: response.data?.meta || { page: 1, limit: 30, total: 0, totalPages: 1 },
    }
}

export async function getTaskSuggestions(taskId: string) {
    const response = await api.get(`/tasks/${taskId}/suggest-assignee`)
    return response.data?.suggestion
}

export async function createTask(payload: CreateTaskPayload) {
    const response = await api.post('/tasks/create', payload)
    return response.data?.task
}

export async function assignTask(payload: AssignTaskPayload) {
    const body = {
        taskId: payload.taskId,
        employeeId: payload.employeeId,
        assignmentMode: payload.assignmentMode || 'manual',
        requiredSkills: payload.requiredSkills || [],
    }

    const response = await api.post('/tasks/assign', body)
    return {
        task: response.data?.task,
        suggestion: response.data?.suggestion,
        allCandidates: response.data?.allCandidates || [],
    }
}

export async function updateTask(taskId: string, payload: UpdateTaskPayload) {
    const response = await api.put(`/tasks/${taskId}`, payload)
    return response.data?.task
}

export async function deleteTask(taskId: string) {
    const response = await api.delete(`/tasks/${taskId}`)
    return response.data
}

export async function getEmployeesForAssignment(search = ''): Promise<EmployeeOption[]> {
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('limit', '100')
    if (search.trim()) params.set('search', search.trim())

    const response = await api.get(`/employees?${params.toString()}`)
    const rows = response.data?.data || []

    return rows.map((row: any) => ({
        _id: row._id,
        fullName: row.fullName,
        email: row.email,
        currentWorkload: Number(row.currentWorkload || 0),
        department: row.department || undefined,
    }))
}

export async function getTaskTemplates(params: {
    page?: number
    limit?: number
    search?: string
    department?: string
    includeInactive?: boolean
} = {}) {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    if (params.search) q.set('search', params.search)
    if (params.department) q.set('department', params.department)
    if (params.includeInactive) q.set('includeInactive', String(params.includeInactive))

    const response = await api.get(`/tasks/templates?${q.toString()}`)
    return {
        templates: (response.data?.templates || []) as TaskTemplateItem[],
        meta: response.data?.meta || { page: 1, limit: 20, total: 0, totalPages: 1 },
    }
}

export async function createTaskTemplate(payload: CreateTaskTemplatePayload) {
    const response = await api.post('/tasks/templates', payload)
    return response.data?.template as TaskTemplateItem
}

export async function updateTaskTemplate(templateId: string, payload: UpdateTaskTemplatePayload) {
    const response = await api.put(`/tasks/templates/${templateId}`, payload)
    return response.data?.template as TaskTemplateItem
}

export async function deleteTaskTemplate(templateId: string) {
    const response = await api.delete(`/tasks/templates/${templateId}`)
    return response.data
}

export async function breakDownTask(payload: { title: string; description?: string; effort: number }) {
    const response = await api.post('/ai/break-down-task', payload)
    return response.data?.breakdown as Array<{
        title: string
        description: string
        effort: number
        priority: TaskPriority
    }>
}

export async function createBulkTasks(tasks: CreateTaskPayload[]) {
    const response = await api.post('/tasks/bulk-create', { tasks })
    return response.data
}

export async function distributeBulkTasks(taskIds: string[]) {
    const response = await api.post('/tasks/bulk-distribute', { taskIds })
    return response.data?.mapping as Array<{
        taskId: string
        taskTitle: string
        employeeId: string
        employeeName: string
        projectedWorkload: number
        reason: string
    }>
}

export async function assignBulkTasks(assignments: Array<{ taskId: string; employeeId: string }>) {
    const response = await api.post('/tasks/bulk-assign', { assignments })
    return response.data
}

export async function aiDistributeTasks(tasks: Array<{ title: string; effort: number; priority: string }>) {
    const response = await api.post('/ai/ai-distribute', { tasks })
    return response.data?.mapping as Array<{
        taskIndex: number
        taskTitle: string
        effort: number
        priority: string
        employeeId: string
        employeeName: string
        employeeEmail: string
        projectedWorkload: number
        reason: string
        policyStatus: string
        policyWarnings: string[]
    }>
}