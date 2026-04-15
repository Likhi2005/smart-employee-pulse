// Add these to your existing index.ts

export interface Task {
    id: string;
    title: string;
    description: string;
    effort: number;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'rejected';
    assignedBy: string;
    assignedTo?: string;
    assignedToName?: string;
    dueDate: string;
    isMandatory: boolean;
    createdAt: string;
    completedAt?: string;
}

export interface AIsuggestion {
    rank: number;
    employee: {
        id: string;
        name: string;
        avatar: string;
        email: string;
    };
    analysis: {
        currentWorkload: number;
        taskImpact: number;
        projectedWorkload: number;
        reason: string;
    };
}

export interface AssignmentFlowState {
    step: 1 | 2;
    selectedTask: Task | null;
    suggestions: AIsuggestion[];
    selectedEmployee: string | null;
    isLoading: boolean;
}

export interface TaskFilters {
    status: string;
    priority: string;
    assignee: string;
    searchQuery: string;
    sortBy: 'dueDate' | 'priority' | 'effort';
}