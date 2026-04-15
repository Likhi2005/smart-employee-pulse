import { useState, useCallback } from 'react';
import { Task, AIsuggestion } from '@/types/index';
import { employeesData } from '@/data/managerStatsData';

export function useAssignmentFlow() {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [suggestions, setSuggestions] = useState<AIsuggestion[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Get AI suggestions (backend: GET /api/tasks/suggestions?taskId=...)
    const getAISuggestions = useCallback(async (task: Task) => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await api.get(`/tasks/suggestions?taskId=${task.id}`);
            // setSuggestions(response.data.suggestions);

            // Mock AI suggestion based on our workload algorithm
            const mockSuggestions = generateMockSuggestions(task);
            setSuggestions(mockSuggestions);

            setSelectedTask(task);
            setStep(2);
        } catch (error) {
            console.error('Failed to get suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Confirm assignment
    const confirmAssignment = useCallback(
        (employeeId: string) => {
            if (!selectedTask) return;
            setSelectedEmployee(employeeId);
            return {
                taskId: selectedTask.id,
                employeeId,
            };
        },
        [selectedTask]
    );

    // Reset flow
    const reset = useCallback(() => {
        setStep(1);
        setSelectedTask(null);
        setSuggestions([]);
        setSelectedEmployee(null);
    }, []);

    return {
        // State
        step,
        selectedTask,
        suggestions,
        selectedEmployee,
        isLoading,

        // Actions
        getAISuggestions,
        confirmAssignment,
        reset,
        setSelectedEmployee,
    };
}

// Mock AI suggestion generation based on workload
function generateMockSuggestions(task: Task): AIsuggestion[] {
    const priorityWeights: Record<string, number> = {
        low: 1,
        medium: 2,
        high: 3,
    };

    const taskImpact = task.effort * (priorityWeights[task.priority] || 1);

    // Calculate workload for each employee
    const employeeScores = employeesData.map((emp) => {
        const workloadPoints =
            emp.taskCount * (emp.workloadLevel === 'critical' ? 3 : emp.workloadLevel === 'high' ? 2 : 1);
        return {
            employee: emp,
            currentWorkload: workloadPoints,
            projectedWorkload: workloadPoints + taskImpact,
        };
    });

    // Sort by projected workload
    const sorted = employeeScores.sort((a, b) => a.projectedWorkload - b.projectedWorkload);

    // Return top 3 as suggestions
    return sorted.slice(0, 3).map((score, index) => ({
        rank: index + 1,
        employee: {
            id: score.employee.id,
            name: score.employee.name,
            avatar: score.employee.avatar,
            email: `${score.employee.name.toLowerCase().replace(' ', '.')}@company.com`,
        },
        analysis: {
            currentWorkload: score.currentWorkload,
            taskImpact,
            projectedWorkload: score.projectedWorkload,
            reason:
                index === 0
                    ? `${score.employee.name} has the lowest current workload (${score.currentWorkload} points). Assigning this task will increase their workload by ${taskImpact} points to ${score.projectedWorkload} points.`
                    : `${score.employee.name} is an alternative option with moderate workload. Their workload would be ${score.projectedWorkload} points after assignment.`,
        },
    }));
}