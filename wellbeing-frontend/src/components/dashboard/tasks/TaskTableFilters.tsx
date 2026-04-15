'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface TaskTableFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    statusFilter: string;
    onStatusChange: (status: string) => void;
    priorityFilter: string;
    onPriorityChange: (priority: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

const statusOptions = ['pending', 'assigned', 'in-progress', 'completed', 'rejected', 'on-hold'];
const priorityOptions = ['low', 'medium', 'high', 'critical'];

export default function TaskTableFilters({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    priorityFilter,
    onPriorityChange,
    hasActiveFilters,
    onClearFilters
}: TaskTableFiltersProps) {
    const [openDropdown, setOpenDropdown] = useState<'status' | 'priority' | null>(null);

    return (
        <div className="flex flex-col gap-3 p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2">
                {/* Status Filter */}
                <div className="relative">
                    <button
                        onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                        className="px-3 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 text-foreground rounded border border-neutral-700 transition-colors flex items-center gap-2"
                    >
                        Status
                        {statusFilter && <span className="px-1.5 bg-blue-600 rounded text-xs text-white capitalize">{statusFilter}</span>}
                    </button>

                    {openDropdown === 'status' && (
                        <div className="absolute top-10 left-0 mt-1 w-48 bg-neutral-800 border border-neutral-700 rounded shadow-lg z-50">
                            <button
                                onClick={() => {
                                    onStatusChange('');
                                    setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm text-muted-foreground"
                            >
                                All Statuses
                            </button>
                            {statusOptions.map(status => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        onStatusChange(status);
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm capitalize ${statusFilter === status ? 'bg-blue-600/20 text-blue-400' : 'text-foreground'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Priority Filter */}
                <div className="relative">
                    <button
                        onClick={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
                        className="px-3 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 text-foreground rounded border border-neutral-700 transition-colors flex items-center gap-2"
                    >
                        Priority
                        {priorityFilter && <span className="px-1.5 bg-blue-600 rounded text-xs text-white capitalize">{priorityFilter}</span>}
                    </button>

                    {openDropdown === 'priority' && (
                        <div className="absolute top-10 left-0 mt-1 w-48 bg-neutral-800 border border-neutral-700 rounded shadow-lg z-50">
                            <button
                                onClick={() => {
                                    onPriorityChange('');
                                    setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm text-muted-foreground"
                            >
                                All Priorities
                            </button>
                            {priorityOptions.map(priority => (
                                <button
                                    key={priority}
                                    onClick={() => {
                                        onPriorityChange(priority);
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm capitalize ${priorityFilter === priority ? 'bg-blue-600/20 text-blue-400' : 'text-foreground'
                                        }`}
                                >
                                    {priority}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="gap-1"
                    >
                        <X className="w-4 h-4" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}