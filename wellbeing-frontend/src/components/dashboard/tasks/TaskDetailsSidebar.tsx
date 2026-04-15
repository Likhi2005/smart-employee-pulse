'use client';

import { Task, TaskAssignment } from '@/types/tasks';
import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Tag, CheckSquare } from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import { format } from 'date-fns';
import taskService from '@/services/taskService';

interface TaskDetailsSidebarProps {
    task: Task;
    onClose: () => void;
}

export default function TaskDetailsSidebar({ task, onClose }: TaskDetailsSidebarProps) {
    const [assignmentHistory, setAssignmentHistory] = useState<TaskAssignment[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const history = await taskService.getAssignmentHistory(task.id);
                setAssignmentHistory(history);
            } catch (error) {
                console.error('Failed to load assignment history:', error);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchHistory();
    }, [task.id]);

    return (
        <div className="w-80 bg-neutral-900 border-l border-neutral-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <h2 className="text-lg font-semibold text-foreground truncate">Task Details</h2>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-neutral-800 rounded transition-colors"
                >
                    <X className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Title */}
                <div className="p-4 border-b border-neutral-800">
                    <h3 className="text-base font-semibold text-foreground">{task.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                </div>

                {/* Quick Info Grid */}
                <div className="p-4 space-y-3 border-b border-neutral-800">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Status</span>
                        <TaskStatusBadge status={task.status} />
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Priority</span>
                        <TaskPriorityBadge priority={task.priority} />
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Effort</span>
                        <span className="text-sm font-medium text-foreground">{task.effort} hours</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Mandatory</span>
                        <span className="text-sm font-medium text-foreground">
                            {task.isMandatory ? (
                                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded">Yes</span>
                            ) : (
                                <span className="text-muted-foreground">No</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Dates */}
                <div className="p-4 space-y-3 border-b border-neutral-800">
                    <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Due Date</p>
                            <p className="text-sm text-foreground">{format(new Date(task.dueDate), 'PPpp')}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Created</p>
                            <p className="text-sm text-foreground">{format(new Date(task.createdAt), 'PPpp')}</p>
                        </div>
                    </div>

                    {task.completedAt && (
                        <div className="flex items-start gap-3">
                            <CheckSquare className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Completed</p>
                                <p className="text-sm text-foreground">{format(new Date(task.completedAt), 'PPpp')}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Assignment */}
                <div className="p-4 space-y-3 border-b border-neutral-800">
                    <div className="flex items-start gap-3">
                        <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Assigned To</p>
                            {task.assignedTo ? (
                                <p className="text-sm text-foreground">{task.assignedTo}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Not assigned</p>
                            )}
                        </div>
                    </div>

                    {task.assignedAt && (
                        <div>
                            <p className="text-xs text-muted-foreground">Assigned: {format(new Date(task.assignedAt), 'MMM dd, yyyy')}</p>
                        </div>
                    )}
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                    <div className="p-4 border-b border-neutral-800">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Tags</p>
                        <div className="flex flex-wrap gap-2">
                            {task.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Info */}
                {task.aiSuggestedConfidence !== undefined && (
                    <div className="p-4 border-b border-neutral-800 bg-blue-600/5">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">AI Assignment</p>
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-blue-400">
                                {task.aiSuggestedConfidence}% Confidence
                            </div>
                            <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all"
                                    style={{ width: `${task.aiSuggestedConfidence}%` }}
                                />
                            </div>
                        </div>
                        {task.aiRiskLevel && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Risk Level: <span className="capitalize text-foreground">{task.aiRiskLevel}</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Assignment History */}
                {!isLoadingHistory && assignmentHistory.length > 0 && (
                    <div className="p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Assignment History</p>
                        <div className="space-y-2">
                            {assignmentHistory.slice(0, 3).map((assignment, idx) => (
                                <div key={idx} className="text-xs bg-neutral-800/50 p-2 rounded">
                                    <p className="text-foreground font-medium">{assignment.employeeName}</p>
                                    <p className="text-muted-foreground">
                                        {assignment.status} • {format(new Date(assignment.assignedAt), 'MMM dd')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}