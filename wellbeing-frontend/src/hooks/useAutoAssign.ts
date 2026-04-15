import { useState, useCallback } from 'react';
import assignmentService from '../services/assignmentService';
import taskService from '../services/taskService';
import { workloadEngine } from '../services/workloadEngine';
import { Task, BulkAssignment, BulkAssignMode, RiskTolerance, AssignmentStatus } from '../types/tasks';

interface AutoAssignResult {
    taskId: string;
    taskTitle: string;
    assignedTo: {
        id: string;
        name: string;
        email: string;
    };
    confidenceScore: number;
    status: 'success' | 'failed' | 'partial';
    reason?: string;
    timestamp: Date;
}

interface AutoAssignOperation {
    id: string;
    mode: BulkAssignMode;
    riskTolerance: RiskTolerance;
    taskCount: number;
    successCount: number;
    failureCount: number;
    results: AutoAssignResult[];
    executedAt: Date;
    executedBy: string;
}

export function useAutoAssign() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastOperation, setLastOperation] = useState<AutoAssignOperation | null>(null);
    const [operationHistory, setOperationHistory] = useState<AutoAssignOperation[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getPendingTasks = useCallback(async (): Promise<Task[]> => {
        try {
            setError(null);
            const tasks = await taskService.getTasks({ status: 'pending' });
            return tasks;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch pending tasks';
            setError(message);
            return [];
        }
    }, []);

    const executeBulkAssignment = useCallback(
        async (
            tasks: Task[],
            mode: BulkAssignMode,
            riskTolerance: RiskTolerance,
            userId: string
        ): Promise<AutoAssignOperation | null> => {
            if (tasks.length === 0) {
                setError('No tasks to assign');
                return null;
            }

            setIsProcessing(true);
            setError(null);

            try {
                const results: AutoAssignResult[] = [];
                let successCount = 0;
                let failureCount = 0;

                // Filter tasks based on risk tolerance
                const filteredTasks = tasks.filter((task) => {
                    const riskLevel = workloadEngine.assessRisk(task.effort, task.dueDate);

                    if (riskTolerance === 'conservative' && riskLevel === 'critical') return false;
                    if (riskTolerance === 'conservative' && riskLevel === 'high') return false;
                    if (riskTolerance === 'moderate' && riskLevel === 'critical') return false;

                    return true;
                });

                // Process each task
                for (const task of filteredTasks) {
                    try {
                        const suggestions = await assignmentService.generateSuggestions(task, mode);

                        if (suggestions.length > 0) {
                            const topSuggestion = suggestions[0];

                            // Attempt assignment
                            const assigned = await taskService.assignTask(task.id, topSuggestion.employeeId, {
                                aiSuggested: true,
                                confidenceScore: topSuggestion.confidenceScore,
                                suggestion: topSuggestion,
                            });

                            if (assigned) {
                                results.push({
                                    taskId: task.id,
                                    taskTitle: task.title,
                                    assignedTo: {
                                        id: topSuggestion.employeeId,
                                        name: topSuggestion.employeeName,
                                        email: topSuggestion.employeeEmail,
                                    },
                                    confidenceScore: topSuggestion.confidenceScore,
                                    status: 'success',
                                    timestamp: new Date(),
                                });
                                successCount++;
                            } else {
                                results.push({
                                    taskId: task.id,
                                    taskTitle: task.title,
                                    assignedTo: { id: '', name: 'Unassigned', email: '' },
                                    confidenceScore: 0,
                                    status: 'failed',
                                    reason: 'Assignment execution failed',
                                    timestamp: new Date(),
                                });
                                failureCount++;
                            }
                        } else {
                            results.push({
                                taskId: task.id,
                                taskTitle: task.title,
                                assignedTo: { id: '', name: 'Unassigned', email: '' },
                                confidenceScore: 0,
                                status: 'failed',
                                reason: 'No suitable employee found',
                                timestamp: new Date(),
                            });
                            failureCount++;
                        }
                    } catch (err) {
                        const reason = err instanceof Error ? err.message : 'Unknown error';
                        results.push({
                            taskId: task.id,
                            taskTitle: task.title,
                            assignedTo: { id: '', name: 'Unassigned', email: '' },
                            confidenceScore: 0,
                            status: 'failed',
                            reason,
                            timestamp: new Date(),
                        });
                        failureCount++;
                    }
                }

                // Create operation record
                const operation: AutoAssignOperation = {
                    id: `auto-${Date.now()}`,
                    mode,
                    riskTolerance,
                    taskCount: filteredTasks.length,
                    successCount,
                    failureCount,
                    results,
                    executedAt: new Date(),
                    executedBy: userId,
                };

                setLastOperation(operation);
                setOperationHistory((prev) => [operation, ...prev]);

                return operation;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Bulk assignment failed';
                setError(message);
                return null;
            } finally {
                setIsProcessing(false);
            }
        },
        []
    );

    const undoLastOperation = useCallback(async (): Promise<boolean> => {
        if (!lastOperation) {
            setError('No operation to undo');
            return false;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Revert all successful assignments
            const successIds = lastOperation.results
                .filter((r) => r.status === 'success')
                .map((r) => r.taskId);

            for (const taskId of successIds) {
                await taskService.updateTask(taskId, { assignedTo: null, status: 'pending' });
            }

            setLastOperation(null);
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Undo operation failed';
            setError(message);
            return false;
        } finally {
            setIsProcessing(false);
        }
    }, [lastOperation]);

    return {
        getPendingTasks,
        executeBulkAssignment,
        undoLastOperation,
        lastOperation,
        operationHistory,
        isProcessing,
        error,
    };
}