import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { HistoryFilters } from '../../../../hooks/useAssignmentHistory';

interface HistoryFiltersProps {
    filters: HistoryFilters;
    onUpdateFilters: (filters: Partial<HistoryFilters>) => void;
    onClearFilters: () => void;
}

const statusOptions = [
    { value: 'assigned', label: 'Assigned' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'completed', label: 'Completed' },
];

const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
];

export default function HistoryFilters({
    filters,
    onUpdateFilters,
    onClearFilters,
}: HistoryFiltersProps) {
    const hasActiveFilters =
        filters.status ||
        filters.priority ||
        filters.assignee ||
        filters.searchQuery ||
        filters.aiOnly;

    return (
        <Card className="p-4">
            <div className="space-y-4">
                {/* Search */}
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
                    <Input
                        type="text"
                        placeholder="Search by task title, assignee, or task ID..."
                        value={filters.searchQuery || ''}
                        onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
                        className="w-full"
                    />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">From Date</label>
                        <Input
                            type="date"
                            value={filters.dateRange.from.toISOString().split('T')[0]}
                            onChange={(e) =>
                                onUpdateFilters({
                                    dateRange: {
                                        ...filters.dateRange,
                                        from: new Date(e.target.value),
                                    },
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">To Date</label>
                        <Input
                            type="date"
                            value={filters.dateRange.to.toISOString().split('T')[0]}
                            onChange={(e) =>
                                onUpdateFilters({
                                    dateRange: {
                                        ...filters.dateRange,
                                        to: new Date(e.target.value),
                                    },
                                })
                            }
                        />
                    </div>
                </div>

                {/* Status & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                        <select
                            value={filters.status || ''}
                            onChange={(e) =>
                                onUpdateFilters({
                                    status: (e.target.value as any) || undefined,
                                })
                            }
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-foreground text-sm"
                        >
                            <option value="">All Statuses</option>
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Priority</label>
                        <select
                            value={filters.priority || ''}
                            onChange={(e) =>
                                onUpdateFilters({
                                    priority: (e.target.value as any) || undefined,
                                })
                            }
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-foreground text-sm"
                        >
                            <option value="">All Priorities</option>
                            {priorityOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* AI Only Checkbox */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="aiOnly"
                        checked={filters.aiOnly || false}
                        onChange={(e) => onUpdateFilters({ aiOnly: e.target.checked })}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-blue-600 cursor-pointer"
                    />
                    <label htmlFor="aiOnly" className="text-sm text-muted-foreground cursor-pointer">
                        AI-suggested assignments only
                    </label>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClearFilters}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-foreground dark:hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Clear All Filters
                    </motion.button>
                )}
            </div>
        </Card>
    );
}