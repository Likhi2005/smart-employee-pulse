import { useState, useCallback } from 'react';
import { Task, TaskFilters } from '@/types/index';
import { tasksData } from '@/data/tasksData';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>(tasksData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get all tasks (from backend: GET /api/tasks/team-tasks)
    const getTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await api.get('/tasks/team-tasks');
            // setTasks(response.data);
            setTasks(tasksData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch tasks');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create new task (backend: POST /api/tasks/create)
    const createTask = useCallback(
        async (taskData: Omit<Task, 'id' | 'createdAt' | 'assignedTo'>) => {
            setIsLoading(true);
            try {
                // TODO: Replace with actual API call
                // const response = await api.post('/tasks/create', taskData);
                // const newTask = response.data.task;

                const newTask: Task = {
                    ...taskData,
                    id: `task-${Date.now()}`,
                    createdAt: new Date().toISOString().split('T')[0],
                };

                setTasks((prev) => [newTask, ...prev]);
                setError(null);
                return newTask;
            } catch (err) {
                setError('Failed to create task');
                console.error(err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Assign task (backend: POST /api/tasks/assign)
    const assignTask = useCallback(
        async (taskId: string, employeeId: string, useAI: boolean = false) => {
            setIsLoading(true);
            try {
                // TODO: Replace with actual API call
                // const response = await api.post('/tasks/assign', {
                //   taskId,
                //   employeeId,
                //   useAIAssignment: useAI,
                // });

                setTasks((prev) =>
                    prev.map((task) =>
                        task.id === taskId
                            ? {
                                ...task,
                                status: 'assigned',
                                assignedTo: employeeId,
                                assignedToName: getEmployeeName(employeeId),
                            }
                            : task
                    )
                );
                setError(null);
            } catch (err) {
                setError('Failed to assign task');
                console.error(err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Update task status
    const updateTaskStatus = useCallback(
        (taskId: string, newStatus: Task['status']) => {
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === taskId
                        ? {
                            ...task,
                            status: newStatus,
                            completedAt:
                                newStatus === 'completed'
                                    ? new Date().toISOString().split('T')[0]
                                    : undefined,
                        }
                        : task
                )
            );
        },
        []
    );

    return {
        tasks,
        isLoading,
        error,
        getTasks,
        createTask,
        assignTask,
        updateTaskStatus,
    };
}

function getEmployeeName(employeeId: string): string {
    const employeeMap: Record<string, string> = {
        '1': 'Arjun Kumar',
        '2': 'Priya Singh',
        '3': 'Rahul Patel',
    };
    return employeeMap[employeeId] || 'Unknown';
}