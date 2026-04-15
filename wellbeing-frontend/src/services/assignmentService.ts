import api from './api';
import {
    Task,
    AIAssignmentSuggestion,
    WorkloadSnapshot,
    BulkAssignmentRequest,
    BulkAssignmentResult,
    BulkAssignmentBatch
} from '@/types/tasks';
import { workloadEngine } from './workloadEngine';

/**
 * Assignment service for AI-driven task assignment
 */
class AssignmentService {
    /**
     * Generate AI suggestions for task assignment
     * First tries backend AI, falls back to rule-based
     */
    async generateSuggestions(
        task: Task,
        employeeSnapshots: Map<string, WorkloadSnapshot>,
        topN: number = 3
    ): Promise<AIAssignmentSuggestion[]> {
        // Try backend AI first
        try {
            const response = await api.post('/ai/suggest-assignment', {
                taskId: task.id,
                title: task.title,
                description: task.description,
                effort: task.effort,
                priority: task.priority,
                dueDate: task.dueDate,
                skills: task.skills,
                employeeIds: Array.from(employeeSnapshots.keys())
            });

            return response.data.suggestions as AIAssignmentSuggestion[];
        } catch (error) {
            console.warn('Backend AI failed, using rule-based suggestions:', error);
            // Fall back to rule-based
            return this.generateRuleBasedSuggestions(task, employeeSnapshots, topN);
        }
    }

    /**
     * Rule-based suggestion fallback
     * Uses weighted scoring: workload (40%) + capacity (30%) + deadline risk (20%) + priority (10%)
     */
    private generateRuleBasedSuggestions(
        task: Task,
        employeeSnapshots: Map<string, WorkloadSnapshot>,
        topN: number
    ): AIAssignmentSuggestion[] {
        const suggestions: AIAssignmentSuggestion[] = [];

        employeeSnapshots.forEach((currentSnapshot, employeeId) => {
            const projectedWorkload = workloadEngine.calculateProjectedWorkload(currentSnapshot, task);
            const overloadCheck = workloadEngine.checkOverloadWarning(currentSnapshot, task.effort);

            // Scoring algorithm: 0-100
            const workloadScore = 100 - projectedWorkload.workloadScore; // Lower projected = better
            const capacityScore = Math.max(
                Math.min((projectedWorkload.availableCapacity / task.effort) * 100, 100),
                0
            );
            const deadlineScore = 100 - projectedWorkload.deadlineRisk;
            const priorityScore = this.getPriorityScore(task.priority, currentSnapshot);

            // Weighted combination
            const confidence = Math.round(
                workloadScore * 0.35 +
                capacityScore * 0.25 +
                deadlineScore * 0.25 +
                priorityScore * 0.15
            );

            // Build reasoning
            const warnings: string[] = [];
            if (overloadCheck.wouldOverload && overloadCheck.severity === 'critical') {
                warnings.push('⚠️ Would cause critical overload');
            }
            if (projectedWorkload.riskLevel === 'high') {
                warnings.push('⚠️ High employee risk level');
            }

            const reasoning =
                `Capacity: ${projectedWorkload.availableCapacity.toFixed(1)}h remaining | ` +
                `Risk: ${projectedWorkload.riskLevel} | ` +
                `Deadline Pressure: ${projectedWorkload.deadlineRisk}%`;

            suggestions.push({
                rank: 0, // Will be set after sorting
                employeeId,
                employeeName: currentSnapshot.employeeName || 'Unknown',
                avatar: currentSnapshot.avatar,
                confidence,
                analysis: {
                    currentWorkload: currentSnapshot,
                    projectedWorkload,
                    skillMatch: 85, // TODO: implement skill matching
                    deadline_proximity_risk: projectedWorkload.deadlineRisk,
                    acceptance_probability: 80, // TODO: implement acceptance prediction
                    overload_risk: overloadCheck.wouldOverload ? 100 : 20,
                    reasoning,
                    warnings: warnings.length > 0 ? warnings : undefined
                }
            });
        });

        // Sort by confidence descending and assign ranks
        return suggestions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, topN)
            .map((s, i) => ({ ...s, rank: i + 1 }));
    }

    /**
     * Calculate priority-based assignment preference
     * Helps balance high-priority tasks across team
     */
    private getPriorityScore(priority: Task['priority'], snapshot: WorkloadSnapshot): number {
        // High/critical tasks should go to people with lower workload
        const taskPriorityWeight = {
            critical: 30,
            high: 20,
            medium: 10,
            low: 5
        };

        const personBusyFactor = snapshot.workloadScore / 100; // 0 to 1
        const score = taskPriorityWeight[priority] * (1 - personBusyFactor);

        return Math.min(score, 100);
    }

    /**
     * Execute bulk assignment for multiple tasks
     */
    async executeBulkAssignment(
        request: BulkAssignmentRequest
    ): Promise<BulkAssignmentBatch> {
        try {
            const response = await api.post('/tasks/bulk-assign', {
                taskIds: request.taskIds,
                mode: request.mode,
                riskTolerance: request.riskTolerance
            });

            return response.data as BulkAssignmentBatch;
        } catch (error) {
            console.error('Bulk assignment failed:', error);
            throw error;
        }
    }

    /**
     * Undo a previous bulk assignment batch
     */
    async undoBulkAssignment(batchId: string) {
        try {
            const response = await api.post(`/tasks/bulk-assign/${batchId}/undo`);
            return response.data;
        } catch (error) {
            console.error(`Failed to undo bulk assignment ${batchId}:`, error);
            throw error;
        }
    }

    /**
     * Get history of bulk assignments
     */
    async getBulkAssignmentHistory(limit: number = 10) {
        try {
            const response = await api.get('/tasks/bulk-assign/history', {
                params: { limit }
            });
            return response.data as BulkAssignmentBatch[];
        } catch (error) {
            console.error('Failed to fetch bulk assignment history:', error);
            throw error;
        }
    }
}

export default new AssignmentService();