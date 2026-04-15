import React from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Card } from '../../../ui/Card';
import { AssignmentRecord } from '../../../../hooks/useAssignmentHistory';
import TaskPriorityBadge from '../TaskPriorityBadge';
import TaskStatusBadge from '../TaskStatusBadge';

interface AssignmentDetailsModalProps {
    record: AssignmentRecord;
    onClose: () => void;
}

const statusColorMap: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    assigned: { icon: <CheckCircle className="w-5 h-5" />, color: 'text-blue-600 dark:text-blue-400', label: 'Assigned' },
    rejected: { icon: <XCircle className="w-5 h-5" />, color: 'text-red-600 dark:text-red-400', label: 'Rejected' },
    accepted: {
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'text-emerald-600 dark:text-emerald-400',
        label: 'Accepted',
    },
    completed: {
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'text-purple-600 dark:text-purple-400',
        label: 'Completed',
    },
};

export default function AssignmentDetailsModal({ record, onClose }: AssignmentDetailsModalProps) {
    const statusInfo = statusColorMap[record.assignmentStatus];
    const daysAgo = Math.floor((Date.now() - new Date(record.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <Modal isOpen onClose={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto shadow-xl"
            >
                {/* Header */}
                <div className="sticky top-0 bg-neutral-50 dark:bg-neutral-800 px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Assignment Details</h2>
                        <p className="text-xs text-muted-foreground mt-1">ID: {record.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Task Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">📋 Task Information</h3>
                        <Card className="p-4 space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Title</p>
                                <p className="text-foreground font-medium">{record.taskTitle}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Priority</p>
                                    <TaskPriorityBadge priority={record.taskPriority} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                                    <TaskStatusBadge status={record.taskStatus} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Effort</p>
                                    <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-sm font-medium text-foreground">
                                        {record.effort}h
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                                <p className="text-foreground font-medium">
                                    {new Date(record.dueDate).toLocaleDateString()} ({Math.ceil((new Date(record.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days away)
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Assignment Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">👤 Assignment Details</h3>
                        <Card className="p-4 space-y-3">
                            {record.previousAssignee && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Previous Assignee</p>
                                    <p className="text-foreground">
                                        {record.previousAssignee.name}
                                        <span className="text-muted-foreground text-xs"> ({record.previousAssignee.email})</span>
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-3 py-2 px-3 bg-blue-50 dark:bg-blue-950/10 rounded-lg border border-blue-200 dark:border-blue-900/40">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Assigned To</p>
                                    <p className="text-foreground font-semibold">{record.newAssignee.name}</p>
                                    <p className="text-xs text-muted-foreground">{record.newAssignee.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2">
                                    <div className={statusInfo.color}>{statusInfo.icon}</div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Assignment Status</p>
                                        <p className="text-foreground font-medium capitalize">{statusInfo.label}</p>
                                    </div>
                                </div>

                                {record.confidenceScore !== undefined && (
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Confidence</p>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{record.confidenceScore}%</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* AI Info */}
                    {record.aiSuggested && (
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                AI Suggestion
                            </h3>
                            <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/10 border-yellow-200 dark:border-yellow-900/40">
                                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                                    This assignment was suggested by the AI engine based on workload analysis, skill matching, and deadline risk assessment.
                                </p>
                                {record.reason && (
                                    <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-2 italic">
                                        "{record.reason}"
                                    </p>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* Timeline */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            Timeline
                        </h3>
                        <Card className="p-4 space-y-2 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Created</p>
                                    <p className="text-foreground font-medium">{new Date(record.createdAt).toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">{daysAgo} days ago</p>
                                </div>
                            </div>

                            {record.updatedAt !== record.createdAt && (
                                <div className="flex items-start gap-3 border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2">
                                    <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mt-2 flex-shrink-0" />
                                    <div>
                                        <p className="text-muted-foreground">Last Updated</p>
                                        <p className="text-foreground font-medium">{new Date(record.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </motion.div>
        </Modal>
    );
}