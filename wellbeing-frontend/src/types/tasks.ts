// Enhanced task management types for the entire system

export type TaskStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'rejected' | 'on-hold';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type AssignmentStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type BulkAssignMode = 'balanced' | 'fastest' | 'skill-based';
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

// ===== MAIN TASK INTERFACE =====
export interface Task {
    id: string;
    title: string;
    description: string;
    effort: number; // hours required
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string; // ISO format
    createdAt: string;
    completedAt?: string;
    isMandatory: boolean;
    skills?: string[]; // required skills
    tags?: string[];

    // Assignment metadata
    assignedBy: string; // manager ID
    assignedTo?: string; // employee ID
    assignedAt?: string;
    acceptedAt?: string;
    rejectionReason?: string;

    // AI metadata
    aiSuggestedConfidence?: number; // 0-100
    aiRiskLevel?: 'low' | 'medium' | 'high'; // deadline risk
    autoAssigned?: boolean;
}

// ===== ASSIGNMENT TRACKING =====
export interface TaskAssignment {
    id: string;
    taskId: string;
    employeeId: string;
    employeeName: string;
    assignedBy: string;
    assignedAt: string;
    status: AssignmentStatus;
    acceptedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    completedAt?: string;
    notes?: string;
    autoAssigned?: boolean;
}

// ===== WORKLOAD CALCULATION =====
export interface WorkloadSnapshot {
    employeeId: string;
    employeeName: string;
    avatar?: string;
    totalTasksActive: number;
    totalEffortHours: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;

    // Metrics
    workloadScore: number; // 0-100, normalized percent of 40-hour week
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    availableCapacity: number; // hours remaining in work week (40h baseline)
    deadlineRisk: number; // 0-100, deadline pressure score

    // Timestamp
    calculatedAt: string;
}

// ===== AI SUGGESTION =====
export interface AIAssignmentSuggestion {
    rank: number; // 1, 2, 3 for top suggestions
    employeeId: string;
    employeeName: string;
    avatar?: string;
    confidence: number; // 0-100, overall recommendation score

    // Deep analysis
    analysis: {
        currentWorkload: WorkloadSnapshot;
        projectedWorkload: WorkloadSnapshot;

        // Scoring components
        skillMatch: number; // 0-100
        deadline_proximity_risk: number; // 0-100, lower is better
        acceptance_probability: number; // 0-100, likelihood employee accepts
        overload_risk: number; // 0-100, risk of overload

        // Human readable
        reasoning: string;
        warnings?: string[];
    };
}

// ===== TEMPLATES =====
export interface TaskTemplate {
    id: string;
    name: string;
    description: string;
    effort: number;
    priority: TaskPriority;
    skills?: string[];
    tags?: string[];
    createdBy: string;
    createdAt: string;
    usageCount: number;
    isPublic: boolean; // manager-wide or personal
}

// ===== BULK OPERATIONS =====
export interface BulkAssignmentRequest {
    taskIds: string[];
    mode: BulkAssignMode;
    riskTolerance: RiskTolerance;
}

export interface BulkAssignmentResult {
    taskId: string;
    taskTitle: string;
    assignedTo: string;
    employeeName: string;
    confidence: number;
    status: 'success' | 'failed';
    reason?: string;
}

export interface BulkAssignmentBatch {
    id: string;
    createdAt: string;
    mode: BulkAssignMode;
    riskTolerance: RiskTolerance;
    results: BulkAssignmentResult[];
    totalTasks: number;
    successCount: number;
    failedCount: number;
    canUndo: boolean;
}

// ===== FILTERS & SORTING =====
export interface TaskFilters {
    status?: TaskStatus | TaskStatus[];
    priority?: TaskPriority | TaskPriority[];
    assignedTo?: string; // employee ID
    assignedBy?: string; // manager ID
    dueDate?: { from: string; to: string }; // date range
    isMandatory?: boolean;
    searchQuery?: string;
}

export interface SortOptions {
    field: 'dueDate' | 'priority' | 'effort' | 'createdAt' | 'status';
    direction: 'asc' | 'desc';
}