import api from '@/services/api'

export interface TaskBreakdownItem {
    title: string
    description: string
    effort: number
    priority: 'low' | 'medium' | 'high'
}

export interface AIDistributionItem {
    taskIndex: number
    taskTitle: string
    effort: number
    priority: string
    employeeId: string
    employeeName: string
    employeeEmail: string
    projectedWorkload: number
    reason: string
    policyStatus: 'pass' | 'warn' | 'block'
    policyWarnings: string[]
}

export interface PriorityDetectionResult {
    priority: 'low' | 'medium' | 'high'
    confidence: number
    reasoning: string
}

// ============================================================
// 1. AI Task Breakdown (Smart Project Decomposition)
//    POST /ai/break-down-task
// ============================================================
export async function breakdownProject(payload: {
    title: string
    description?: string
    effort: number
}): Promise<{ subtasks: TaskBreakdownItem[]; breakdownStrategy: string }> {
    const response = await api.post('/ai/break-down-task', payload)
    return {
        subtasks: (response.data?.breakdown || []) as TaskBreakdownItem[],
        breakdownStrategy: response.data?.breakdownStrategy || '',
    }
}

// ============================================================
// 2. AI + Policy-Engine Bulk Distribution
//    POST /ai/ai-distribute
//    Validates each task against the policy engine, then uses
//    Gemini AI to optimally assign tasks to team members.
// ============================================================
export async function aiDistributeTasks(
    tasks: Array<{ title: string; effort: number; priority: string }>
): Promise<AIDistributionItem[]> {
    const response = await api.post('/ai/ai-distribute', { tasks })
    return (response.data?.mapping || []) as AIDistributionItem[]
}

// ============================================================
// 3. AI Priority Detection
//    POST /ai/detect-priority
// ============================================================
export async function detectTaskPriority(payload: {
    title: string
    description?: string
}): Promise<PriorityDetectionResult> {
    const response = await api.post('/ai/detect-priority', payload)
    return response.data?.result as PriorityDetectionResult
}

// ============================================================
// 4. AI Smart Assignment (for a single existing task)
//    POST /ai/smart-assign/:taskId
// ============================================================
export async function smartAssignTask(taskId: string): Promise<{
    success: boolean
    recommendedEmployee?: {
        id: string
        name: string
        email: string
        department: string
    }
    analysis?: {
        reason: string
        workloadAfterTask: number
        riskFactors: string[]
        alternatives: string[]
    }
    strategy?: string
    reason?: string
}> {
    const response = await api.post(`/ai/smart-assign/${taskId}`)
    return response.data?.recommendation || { success: false, reason: 'No recommendation returned' }
}

// ============================================================
// 5. AI Performance Insights
//    GET /ai/performance-insights
// ============================================================
export async function getPerformanceInsights(): Promise<{
    insights: Array<{
        title: string
        description: string
        recommendation: string
    }>
}> {
    const response = await api.get('/ai/performance-insights')
    return response.data?.insights || { insights: [] }
}
