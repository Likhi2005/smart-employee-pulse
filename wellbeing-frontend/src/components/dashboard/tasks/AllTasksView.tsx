'use client';

import { useState, useMemo } from 'react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import TasksTable from './TasksTable';
import TaskTableFilters from './TaskTableFilters';
import TaskDetailsSidebar from './TaskDetailsSidebar';
import { Task, TaskFilters } from '@/types/tasks';
import { Button } from '@/components/ui/Button';
import { Plus, AlertCircle } from 'lucide-react';

export default function AllTasksView() {
    const { tasks, isLoading, error, filters, setFilters, fetchTasks } = useTaskManagement();
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    // Destructure filter states
    const searchQuery = (filters.searchQuery as string) || '';
    const statusFilter = (filters.status as string) || '';
    const priorityFilter = (filters.priority as string) || '';

    // Filter and sort tasks
    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => {
                const matchesSearch =
                    !searchQuery ||
                    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.description.toLowerCase().includes(searchQuery.toLowerCase());

                const matchesStatus = !statusFilter || task.status === statusFilter;
                const matchesPriority = !priorityFilter || task.priority === priorityFilter;

                return matchesSearch && matchesStatus && matchesPriority;
            })
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [tasks, searchQuery, statusFilter, priorityFilter]);

    const selectedTask = tasks.find(t => t.id === selectedTaskId);

    const handleSearchChange = (query: string) => {
        setFilters({ ...filters, searchQuery: query });
    };

    const handleStatusChange = (status: string) => {
        setFilters({ ...filters, status: status || undefined });
    };

    const handlePriorityChange = (priority: string) => {
        setFilters({ ...filters, priority: priority || undefined });
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    return (
        <div className="flex flex-col gap-6 p-6 h-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">All Tasks</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {filteredTasks.length} of {tasks.length} tasks
                        {statusFilter && ` • Status: ${statusFilter}`}
                        {priorityFilter && ` • Priority: ${priorityFilter}`}
                    </p>
                </div>
                <Button
                    className="gap-2"
                    onClick={() => console.log('Navigate to create task')}
                >
                    <Plus className="w-4 h-4" />
                    New Task
                </Button>
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-500">{error}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchTasks}
                        className="text-red-500 hover:text-red-600"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Filters */}
            <TaskTableFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                priorityFilter={priorityFilter}
                onPriorityChange={handlePriorityChange}
                hasActiveFilters={!!(searchQuery || statusFilter || priorityFilter)}
                onClearFilters={handleClearFilters}
            />

            {/* Content Area: Table + Sidebar */}
            <div className="flex gap-6 flex-1 overflow-hidden">
                {/* Tasks Table */}
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                            <div className="animate-pulse flex flex-col items-center gap-2">
                                <div className="w-8 h-8 bg-muted-foreground/20 rounded-full" />
                                <p>Loading tasks...</p>
                            </div>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-muted-foreground flex-col gap-2">
                            <p className="text-lg font-medium">No tasks found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <TasksTable
                            tasks={filteredTasks}
                            selectedTaskId={selectedTaskId}
                            onSelectTask={setSelectedTaskId}
                        />
                    )}
                </div>

                {/* Details Sidebar */}
                {selectedTask && (
                    <TaskDetailsSidebar
                        task={selectedTask}
                        onClose={() => setSelectedTaskId(null)}
                    />
                )}
            </div>
        </div>
    );
}