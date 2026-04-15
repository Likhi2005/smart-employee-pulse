import React, { useState } from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import { AssignmentRecord } from '../../../../hooks/useAssignmentHistory';
import TaskPriorityBadge from '../TaskPriorityBadge';

interface HistoryTableProps {
    records: AssignmentRecord[];
    onRecordClick: (record: AssignmentRecord) => void;
}

const statusColorMap: Record<string, { bg: string; text: string; label: string }> = {
    assigned: { bg: 'bg-blue-500/10', text: 'text-blue-600 border border-blue-500/20', label: 'Assigned' },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-600 border border-red-500/20', label: 'Rejected' },
    accepted: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 border border-emerald-500/20', label: 'Accepted' },
    completed: { bg: 'bg-purple-500/10', text: 'text-purple-600 border border-purple-500/20', label: 'Completed' },
};

export default function HistoryTable({ records, onRecordClick }: HistoryTableProps) {
    const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const sortedRecords = [...records].sort((a, b) => {
        let comparison = 0;

        if (sortBy === 'date') {
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === 'priority') {
            const priorityMap = { low: 1, medium: 2, high: 3, critical: 4 };
            comparison = priorityMap[a.taskPriority] - priorityMap[b.taskPriority];
        } else if (sortBy === 'status') {
            comparison = a.assignmentStatus.localeCompare(b.assignmentStatus);
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const handleSort = (column: 'date' | 'priority' | 'status') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    return (
        <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
            {/* Header */}
            <div className="bg-neutral-50 px-6 py-4 grid grid-cols-12 gap-4 border-b border-neutral-200">
                <div className="col-span-4 text-sm font-semibold text-muted-foreground">Task</div>
                <div className="col-span-2 text-sm font-semibold text-muted-foreground">Assignee</div>
                <div
                    className="col-span-2 text-sm font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('status')}
                >
                    Status
                </div>
                <div
                    className="col-span-2 text-sm font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('priority')}
                >
                    Priority
                </div>
                <div className="col-span-2 text-sm font-semibold text-muted-foreground text-right">Date</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-neutral-200">
                {sortedRecords.map((record) => (
                    <button
                        key={record.id}
                        onClick={() => onRecordClick(record)}
                        className="w-full px-6 py-4 grid grid-cols-12 gap-4 hover:bg-neutral-50 transition-colors text-left"
                    >
                        {/* Task Info */}
                        <div className="col-span-4 min-w-0">
                            <div className="flex items-start gap-2">
                                {record.aiSuggested && (
                                    <div className="flex-shrink-0 mt-1">
                                        <Zap className="w-4 h-4 text-yellow-600" title="AI Suggested" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h4 className="font-medium text-foreground truncate text-sm">{record.taskTitle}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">ID: {record.taskId}</p>
                                </div>
                            </div>
                        </div>

                        {/* Assignee */}
                        <div className="col-span-2 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{record.newAssignee.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{record.newAssignee.email}</p>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                            <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColorMap[record.assignmentStatus].text
                                    }`}
                            >
                                {statusColorMap[record.assignmentStatus].label}
                            </span>
                        </div>

                        {/* Priority */}
                        <div className="col-span-2">
                            <TaskPriorityBadge priority={record.taskPriority} />
                        </div>

                        {/* Date & Action */}
                        <div className="col-span-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(record.createdAt).toLocaleDateString()}
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer Stats */}
            <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-sm text-muted-foreground">
                Showing {sortedRecords.length} records
            </div>
        </div>
    );
}