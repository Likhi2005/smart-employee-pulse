import { useState, useCallback, useEffect } from 'react';
import taskService from '../services/taskService';
import { Task } from '../types/tasks';

export interface AssignmentRecord {
    id: string;
    taskId: string;
    taskTitle: string;
    previousAssignee?: {
        id: string;
        name: string;
        email: string;
    };
    newAssignee: {
        id: string;
        name: string;
        email: string;
    };
    assignmentStatus: 'assigned' | 'rejected' | 'accepted' | 'completed';
    aiSuggested: boolean;
    confidenceScore?: number;
    reason?: string;
    createdAt: Date;
    updatedAt: Date;
    taskPriority: 'low' | 'medium' | 'high' | 'critical';
    taskStatus: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'rejected' | 'on-hold';
    effort: number;
    dueDate: Date;
}

export interface HistoryFilters {
    dateRange: {
        from: Date;
        to: Date;
    };
    status?: 'assigned' | 'rejected' | 'accepted' | 'completed';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    assignee?: string;
    searchQuery?: string;
    aiOnly?: boolean;
}

export function useAssignmentHistory() {
    const [records, setRecords] = useState<AssignmentRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<AssignmentRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<HistoryFilters>({
        dateRange: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            to: new Date(),
        },
    });

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const history = await taskService.getAssignmentHistory();
            setRecords(history);
            applyFilters(history, filters);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch history';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const applyFilters = useCallback(
        (recordsToFilter: AssignmentRecord[], appliedFilters: HistoryFilters) => {
            let filtered = [...recordsToFilter];

            // Date range filter
            filtered = filtered.filter((record) => {
                const recordDate = new Date(record.createdAt);
                return recordDate >= appliedFilters.dateRange.from && recordDate <= appliedFilters.dateRange.to;
            });

            // Status filter
            if (appliedFilters.status) {
                filtered = filtered.filter((r) => r.assignmentStatus === appliedFilters.status);
            }

            // Priority filter
            if (appliedFilters.priority) {
                filtered = filtered.filter((r) => r.taskPriority === appliedFilters.priority);
            }

            // Assignee filter
            if (appliedFilters.assignee) {
                filtered = filtered.filter((r) => r.newAssignee.id === appliedFilters.assignee);
            }

            // AI only filter
            if (appliedFilters.aiOnly) {
                filtered = filtered.filter((r) => r.aiSuggested);
            }

            // Search query filter
            if (appliedFilters.searchQuery) {
                const query = appliedFilters.searchQuery.toLowerCase();
                filtered = filtered.filter(
                    (r) =>
                        r.taskTitle.toLowerCase().includes(query) ||
                        r.newAssignee.name.toLowerCase().includes(query) ||
                        r.newAssignee.email.toLowerCase().includes(query) ||
                        r.taskId.toLowerCase().includes(query)
                );
            }

            setFilteredRecords(filtered);
        },
        []
    );

    const updateFilters = useCallback(
        (newFilters: Partial<HistoryFilters>) => {
            const updated = { ...filters, ...newFilters };
            setFilters(updated);
            applyFilters(records, updated);
        },
        [filters, records, applyFilters]
    );

    const clearFilters = useCallback(() => {
        const defaultFilters: HistoryFilters = {
            dateRange: {
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                to: new Date(),
            },
        };
        setFilters(defaultFilters);
        applyFilters(records, defaultFilters);
    }, [records, applyFilters]);

    const getAssigneeStats = useCallback(() => {
        const stats = new Map<string, { name: string; email: string; count: number; successRate: number }>();

        filteredRecords.forEach((record) => {
            const key = record.newAssignee.id;
            if (!stats.has(key)) {
                stats.set(key, { name: record.newAssignee.name, email: record.newAssignee.email, count: 0, successRate: 0 });
            }
            const stat = stats.get(key)!;
            stat.count++;
            if (record.assignmentStatus === 'completed') {
                stat.successRate += 1;
            }
        });

        // Calculate success rates
        stats.forEach((stat) => {
            stat.successRate = Math.round((stat.successRate / stat.count) * 100);
        });

        return Array.from(stats.values());
    }, [filteredRecords]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        records: filteredRecords,
        allRecords: records,
        isLoading,
        error,
        filters,
        updateFilters,
        clearFilters,
        fetchHistory,
        getAssigneeStats,
    };
}