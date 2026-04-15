import { Task, WorkloadSnapshot, TaskStatus } from '@/types/tasks';

/**
 * Workload calculation engine
 * Calculates employee capacity, risk levels, and projections
 */
export class WorkloadEngine {
    private readonly BASELINE_HOURS = 40; // Standard work week
    private readonly SAFETY_MARGIN = 0.1; // 10% safety buffer

    /**
     * Calculate current workload for an employee
     */
    calculateWorkload(
        employeeId: string,
        employeeName: string,
        activeTasks: Task[],
        avatar?: string
    ): WorkloadSnapshot {
        const now = new Date();
        const activeTaskStats = this.aggregateTaskStats(activeTasks.filter(t =>
            t.status === 'pending' || t.status === 'assigned' || t.status === 'in-progress'
        ));

        const totalEffortHours = activeTaskStats.totalEffort;
        const workloadScore = this.calculateWorkloadScore(totalEffortHours);
        const deadlineRiskScore = this.calculateDeadlineRisk(activeTasks);

        return {
            employeeId,
            employeeName,
            avatar,
            totalTasksActive: activeTasks.length,
            totalEffortHours,
            completedTasks: activeTasks.filter(t => t.status === 'completed').length,
            pendingTasks: activeTasks.filter(t => t.status === 'pending').length,
            inProgressTasks: activeTasks.filter(t => t.status === 'in-progress').length,

            // Metrics
            workloadScore,
            riskLevel: this.determineRiskLevel(workloadScore, deadlineRiskScore),
            availableCapacity: Math.max(this.BASELINE_HOURS - totalEffortHours, 0),
            deadlineRisk: deadlineRiskScore,

            calculatedAt: now.toISOString()
        };
    }

    /**
     * Calculate projected workload if task is assigned
     */
    calculateProjectedWorkload(
        currentSnapshot: WorkloadSnapshot,
        newTask: Task
    ): WorkloadSnapshot {
        const projectedEffort = currentSnapshot.totalEffortHours + newTask.effort;
        const projectedWorkloadScore = this.calculateWorkloadScore(projectedEffort);

        return {
            ...currentSnapshot,
            totalTasksActive: currentSnapshot.totalTasksActive + 1,
            totalEffortHours: projectedEffort,
            pendingTasks: currentSnapshot.pendingTasks + 1,

            workloadScore: projectedWorkloadScore,
            riskLevel: this.determineRiskLevel(projectedWorkloadScore, currentSnapshot.deadlineRisk),
            availableCapacity: Math.max(this.BASELINE_HOURS - projectedEffort, 0),

            calculatedAt: new Date().toISOString()
        };
    }

    /**
     * Calculate workload score (0-100, where 100 is fully allocated)
     * Takes into account safety margin
     */
    private calculateWorkloadScore(effortHours: number): number {
        const effectiveCapacity = this.BASELINE_HOURS * (1 - this.SAFETY_MARGIN);
        const score = (effortHours / effectiveCapacity) * 100;
        return Math.min(Math.round(score), 100);
    }

    /**
     * Calculate deadline risk (0-100)
     * Considers days until due vs effort required
     */
    private calculateDeadlineRisk(tasks: Task[]): number {
        if (tasks.length === 0) return 0;

        const now = new Date();
        const dayInMs = 1000 * 60 * 60 * 24;

        const riskScores = tasks
            .filter(t => t.status !== 'completed')
            .map(task => {
                const daysUntilDue = (new Date(task.dueDate).getTime() - now.getTime()) / dayInMs;
                const workDaysRequired = task.effort / 8; // 8-hour work day

                if (daysUntilDue < 0) return 100; // Overdue = max risk
                if (daysUntilDue === 0) return 100;
                if (daysUntilDue < workDaysRequired) return 85; // Tight deadline
                if (daysUntilDue < workDaysRequired * 1.5) return 60; // Warning zone
                return 20; // Comfortable
            });

        const averageRisk = riskScores.reduce((a, b) => a + b, 0) / Math.max(riskScores.length, 1);
        return Math.round(averageRisk);
    }

    /**
     * Determine overall risk level from workload and deadline scores
     */
    private determineRiskLevel(
        workloadScore: number,
        deadlineRisk: number
    ): 'low' | 'medium' | 'high' | 'critical' {
        const combinedScore = (workloadScore * 0.6 + deadlineRisk * 0.4); // Weight workload more

        if (combinedScore >= 80) return 'critical';
        if (combinedScore >= 60) return 'high';
        if (combinedScore >= 40) return 'medium';
        return 'low';
    }

    /**
     * Aggregate statistics from task list
     */
    private aggregateTaskStats(tasks: Task[]) {
        return {
            totalEffort: tasks.reduce((sum, t) => sum + t.effort, 0),
            highPriorityCount: tasks.filter(t => t.priority === 'high').length,
            criticalCount: tasks.filter(t => t.priority === 'critical').length,
            mandatoryCount: tasks.filter(t => t.isMandatory).length
        };
    }

    /**
     * Check if assigning a task would cause overload warning
     */
    checkOverloadWarning(currentSnapshot: WorkloadSnapshot, taskEffort: number): {
        wouldOverload: boolean;
        message: string;
        severity: 'info' | 'warning' | 'critical';
    } {
        const projectedEffort = currentSnapshot.totalEffortHours + taskEffort;
        const projectedScore = this.calculateWorkloadScore(projectedEffort);

        if (projectedScore >= 100) {
            return {
                wouldOverload: true,
                message: `Would exceed 40-hour capacity by ${Math.round(projectedEffort - 40)}h`,
                severity: 'critical'
            };
        }

        if (projectedScore >= 80) {
            return {
                wouldOverload: true,
                message: `Would reach ${projectedScore}% capacity - high risk`,
                severity: 'warning'
            };
        }

        if (projectedScore >= 60) {
            return {
                wouldOverload: false,
                message: `Would reach ${projectedScore}% capacity - manageable`,
                severity: 'info'
            };
        }

        return {
            wouldOverload: false,
            message: `Plenty of capacity available (${Math.round(40 - projectedEffort)}h remaining)`,
            severity: 'info'
        };
    }
}

export const workloadEngine = new WorkloadEngine();