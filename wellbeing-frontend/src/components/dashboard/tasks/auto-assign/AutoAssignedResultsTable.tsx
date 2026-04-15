import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../../ui/Card';
import { AutoAssignOperation } from '../../../../hooks/useAutoAssign';

interface AutoAssignedResultsTableProps {
    operation: AutoAssignOperation;
}

export default function AutoAssignedResultsTable({ operation }: AutoAssignedResultsTableProps) {
    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <div className="bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="font-semibold text-foreground">Assignment Results</h3>
            </div>

            {/* Table */}
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                <AnimatePresence>
                    {operation.results.map((result, index) => (
                        <motion.div
                            key={result.taskId}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="px-6 py-4 flex items-center justify-between"
                        >
                            {/* Left: Task & Status */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                    {result.status === 'success' ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                    ) : result.status === 'failed' ? (
                                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                    )}

                                    <div className="min-w-0">
                                        <h4 className="font-medium text-foreground truncate text-sm">{result.taskTitle}</h4>
                                        <p className="text-xs text-muted-foreground">ID: {result.taskId}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Assignment & Confidence */}
                            <div className="flex items-center gap-6 ml-4 flex-shrink-0">
                                {result.status === 'success' && (
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-foreground">{result.assignedTo.name}</p>
                                        <p className="text-xs text-muted-foreground">{result.assignedTo.email}</p>
                                    </div>
                                )}

                                {result.reason && (
                                    <div className="text-right max-w-xs">
                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">{result.reason}</p>
                                    </div>
                                )}

                                {result.status === 'success' && (
                                    <div
                                        className="px-3 py-1 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium flex-shrink-0"
                                    >
                                        {result.confidenceScore}%
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer Stats */}
            <div className="bg-neutral-50 dark:bg-neutral-800/50 px-6 py-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between text-sm text-muted-foreground">
                <span>Executed at: {operation.executedAt.toLocaleTimeString()}</span>
                <span>Success Rate: {Math.round((operation.successCount / operation.taskCount) * 100)}%</span>
            </div>
        </Card>
    );
}