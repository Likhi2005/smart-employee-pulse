import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { TaskFilters } from '@/types/index';

interface TaskFiltersProps {
    filters: TaskFilters;
    onFiltersChange: (filters: TaskFilters) => void;
}

export function TaskFilterBar({ filters, onFiltersChange }: TaskFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSearchChange = (query: string) => {
        onFiltersChange({ ...filters, searchQuery: query });
    };

    const handleStatusChange = (status: string) => {
        onFiltersChange({
            ...filters,
            status: filters.status === status ? '' : status,
        });
    };

    const handlePriorityChange = (priority: string) => {
        onFiltersChange({
            ...filters,
            priority: filters.priority === priority ? '' : priority,
        });
    };

    const handleSortChange = (sortBy: 'dueDate' | 'priority' | 'effort') => {
        onFiltersChange({ ...filters, sortBy });
    };

    const hasActiveFilters = filters.status || filters.priority || filters.searchQuery;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-4"
        >
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Search tasks by title or description..."
                    value={filters.searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900/50 py-2.5 pl-10 pr-4 text-sm text-neutral-50 placeholder-neutral-500 focus:border-blue-600 focus:outline-none"
                />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
                {/* Status Filters */}
                {(['pending', 'assigned', 'completed', 'rejected'] as const).map((status) => (
                    <motion.button
                        key={status}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleStatusChange(status)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filters.status === status
                                ? 'bg-blue-600/30 text-blue-400 border border-blue-600/50'
                                : 'bg-neutral-800/50 text-neutral-400 border border-neutral-700 hover:bg-neutral-800'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </motion.button>
                ))}

                {/* Priority Filters */}
                <div className="border-l border-neutral-700"></div>
                {(['low', 'medium', 'high'] as const).map((priority) => (
                    <motion.button
                        key={priority}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handlePriorityChange(priority)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filters.priority === priority
                                ? 'bg-orange-600/30 text-orange-400 border border-orange-600/50'
                                : 'bg-neutral-800/50 text-neutral-400 border border-neutral-700 hover:bg-neutral-800'
                            }`}
                    >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </motion.button>
                ))}

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() =>
                            onFiltersChange({
                                status: '',
                                priority: '',
                                assignee: '',
                                searchQuery: '',
                                sortBy: 'dueDate',
                            })
                        }
                        className="rounded-full px-3 py-1.5 text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
                    >
                        <X className="h-3 w-3" />
                    </motion.button>
                )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Sort by:</span>
                {(['dueDate', 'priority', 'effort'] as const).map((sort) => (
                    <motion.button
                        key={sort}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSortChange(sort)}
                        className={`text-xs px-3 py-1.5 rounded-md transition-colors ${filters.sortBy === sort
                                ? 'bg-blue-600/30 text-blue-400'
                                : 'text-neutral-400 hover:text-neutral-300'
                            }`}
                    >
                        {sort === 'dueDate' ? 'Due Date' : sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}