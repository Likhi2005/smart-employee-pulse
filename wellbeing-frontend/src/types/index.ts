export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'rejected'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskRiskLevel = 'low' | 'medium' | 'high'

export type TaskState =
    | 'DRAFT'
    | 'VALIDATED'
    | 'ENRICHED'
    | 'POLICY_VALIDATED'
    | 'ASSIGNABLE'
    | 'ASSIGNED'
    | 'REVIEW_PENDING'
    | 'APPROVED'
    | 'REJECTED'

export interface TaskAssignee {
    _id: string
    fullName: string
    email?: string
    department?: string
    currentWorkload?: number
    performanceScore?: number
    skills?: string[]
}

export interface StateTransition {
    state: TaskState
    changedAt: string
    changedBy?: {
        _id: string
        fullName: string
    }
    reason?: string
    metadata?: Record<string, any>
}

export interface CandidateRanking {
    employeeId: string
    fullName: string
    email: string
    department?: string
    currentWorkload?: number
    score: number
    confidence: number
    reasons: string[]
    riskFactors: string[]
}

export interface RejectedCandidate {
    employeeId: string
    score: number
    rejectionReasons: string[]
}

export interface AssignmentExplanation {
    topCandidate: {
        employeeId: string
        score: number
        reasons: string[]
        confidence: number
    }
    policyApplied: string
    rejectedCandidates: RejectedCandidate[]
    rankedAt: string
}

export interface PolicyValidationResult {
    status: 'pass' | 'warn' | 'block'
    blockers: string[]
    warnings: string[]
    suggestions: string[]
    metrics: {
        avgTeamWorkload: number
        dueInDays: number | null
        evaluatedAt: string
    }
    serviceState: {
        policyEngine: string
        workloadSnapshot: string
        timestamp: string
    }
}

export interface TaskItem {
    id: string
    _id: string
    title: string
    description?: string
    effort: number
    priority: TaskPriority
    status: TaskStatus
    riskLevel?: TaskRiskLevel
    dueDate?: string
    completedAt?: string
    assignedBy?: string | { _id: string; fullName?: string }
    assignedTo?: string | TaskAssignee | null
    createdAt: string
    updatedAt?: string
    isDeleted?: boolean
    aiSuggestions?: {
        mode?: string
        summary?: string
        recommendations?: string[]
    }
    taskState?: TaskState
    stateHistory?: StateTransition[]
    assignmentExplanation?: AssignmentExplanation
}

export interface TaskListFilters {
    search: string
    status: string
    priority: string
    riskLevel: string
    assignee: string
    dueDate: string
    dueDateFrom: string
    dueDateTo: string
    sortBy: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'effort' | 'riskLevel' | 'status' | 'id'
    sortDir: 'asc' | 'desc'
    page: number
    limit: number
}

export interface TaskListResponse {
    data: TaskItem[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface TaskHistoryItem {
    id: string
    _id: string
    taskId: string
    action: string
    fromStatus?: string
    toStatus?: string
    notes?: string
    createdAt: string
    actorId?: {
        _id: string
        fullName: string
    }
}

export interface Task {
    id: string
    title: string
    description: string
    effort: number
    priority: 'low' | 'medium' | 'high'
    status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'rejected'
    assignedBy: string
    assignedTo?: string
    assignedToName?: string
    dueDate: string
    isMandatory: boolean
    createdAt: string
    completedAt?: string
}

export interface AIsuggestion {
    rank: number
    employee: {
        id: string
        name: string
        avatar: string
        email: string
    }
    analysis: {
        currentWorkload: number
        taskImpact: number
        projectedWorkload: number
        reason: string
    }
}

export interface AssignmentFlowState {
    step: 1 | 2
    selectedTask: Task | null
    suggestions: AIsuggestion[]
    selectedEmployee: string | null
    isLoading: boolean
}

export interface TaskFilters {
    status: string
    priority: string
    assignee: string
    searchQuery: string
    sortBy: 'dueDate' | 'priority' | 'effort'
}

export interface TemplateFilterState {
    search: string
    department: string
    includeInactive: boolean
    page: number
    limit: number
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
    updatedAt?: string
    createdBy?: { _id: string; fullName: string; email?: string }
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