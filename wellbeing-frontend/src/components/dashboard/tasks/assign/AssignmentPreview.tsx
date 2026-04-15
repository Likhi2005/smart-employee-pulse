'use client';

import { Task, WorkloadSnapshot, AIAssignmentSuggestion } from '@/types/tasks';
import TaskStatusBadge from '../TaskStatusBadge';
import TaskPriorityBadge from '../TaskPriorityBadge';
import { format } from 'date-fns';

interface AssignmentPreviewProps {
    task: Task;
    selectedEmployee: string;
    employeeSnapshot?: WorkloadSnapshot;
    suggestion?: AIAssignmentSuggestion;
}

export default function AssignmentPreview({
    task,
    selectedEmployee,
    employeeSnapshot,
    suggestion
}: AssignmentPreviewProps) {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Task Summary */}
            <div className="p-6 bg-neutral-900/50 rounded-lg border border-neutral-800">
                <h3 className="text-lg font-semibold text-foreground mb-4">Task Summary</h3>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-lg font-semibold text-foreground">{task.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Priority</span>
                            <TaskPriorityBadge priority={task.priority} />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Effort</span>
                            <span className="text-sm font-semibold text-foreground">{task.effort}h</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Due</span>
                            <span className="text-sm text-foreground">{format(new Date(task.dueDate), 'MMM dd')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignment Summary */}
            <div className="p-6 bg-neutral-900/50 rounded-lg border border-neutral-800">
                <h3 className="text-lg font-semibold text-foreground mb-4">Assignment Details</h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded">
                        <span className="text-foreground font-medium">Assigning to:</span>
                        <span className="text-foreground">{employeeSnapshot?.employeeName}</span>
                    </div>

                    {suggestion && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">AI Recommendation</span>
                                <span className="text-sm font-semibold text-blue-400">#{suggestion.rank} - {suggestion.confidence}% Confident</span>
                            </div>

                            <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded text-sm text-blue-300">
                                {suggestion.analysis.reasoning}
                            </div>
                        </div>
                    )}

                    {employeeSnapshot && (
                        <>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Current Workload</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600"
                                            style={{ width: `${employeeSnapshot.workloadScore}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">{employeeSnapshot.workloadScore}%</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Available Capacity</span>
                                <span className="text-sm font-semibold text-emerald-400">{employeeSnapshot.availableCapacity.toFixed(1)}h</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Confirmation Message */}
            <div className="p-4 bg-green-600/10 border border-green-600/20 rounded text-green-400 text-sm">
                ✓ Ready to assign. Click "Confirm & Assign" to proceed.
            </div>
        </div>
    );
}