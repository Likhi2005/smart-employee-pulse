'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task, TaskStatus, TaskFilters, SortOptions } from '@/types/tasks';
import taskService from '@/services/taskService';

export const useTaskManagement = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<TaskFilters>({});
    const [sort, setSort] = useState<SortOptions>({ field: 'dueDate', direction: 'asc' });

    // ===== FETCH TASKS =====
    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await taskService.getTasks(filters, sort);
            setTasks(data);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err.message || 'Failed to fetch tasks';
            setError(errorMessage);
            console.error('Task fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [filters, sort]);

    // Fetch on mount and when filters/sort change
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // ===== CREATE TASK =====
    const createTask = useCallback(async (taskData: Partial<Task>) => {
        try {
            const newTask = await taskService.createTask(taskData);
            setTasks(prev => [...prev, newTask]);
            return newTask;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err.message || 'Failed to create task';
            setError(errorMessage);
            throw err;
        }
    }, []);

    // ===== UPDATE TASK =====
    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        try {
            const updated = await taskService.updateTask(taskId, updates);
            setTasks(prev =>
                prev.map(t => (t.id === taskId ? { ...t, ...updates } : t))
            );
            return updated;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err.message || 'Failed to update task';
            setError(errorMessage);
            throw err;
        }
    }, []);

    // ===== UPDATE TASK STATUS =====
    const updateTaskStatus = useCallback(
        async (taskId: string, status: TaskStatus) => {
            return updateTask(taskId, { status });
        },
        [updateTask]
    );

    // ===== DELETE TASK =====
    const deleteTask = useCallback(async (taskId: string) => {
        try {
            await taskService.deleteTask(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err.message || 'Failed to delete task';
            setError(errorMessage);
            throw err;
        }
    }, []);

    // ===== ASSIGN TASK =====
    const assignTask = useCallback(
        async (taskId: string, employeeId: string, options?: { aiSuggested?: boolean; notes?: string }) => {
            try {
                const updated = await taskService.assignTask(taskId, employeeId, options);
                setTasks(prev =>
                    prev.map(t => (t.id === taskId ? updated : t))
                );
                return updated;
            } catch (err: any) {
                const errorMessage = err?.response?.data?.message || err.message || 'Failed to assign task';
                setError(errorMessage);
                throw err;
            }
        },
        []
    );

    // ===== BULK OPERATIONS =====
    const clearError = useCallback(() => setError(null), []);

    return {
        // State
        tasks,
        isLoading,
        error,
        filters,
        sort,

        // Setters
        setFilters,
        setSort,
        clearError,

        // Methods
        fetchTasks,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        assignTask
    };
};