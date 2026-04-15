import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../../ui/Card';
import { AutoAssignOperation } from '../../../../hooks/useAutoAssign';

interface AutoAssignHistoryProps {
    history: AutoAssignOperation[];
}

export default function AutoAssignHistory({ history }: AutoAssignHistoryProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <div className="bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Bulk Assignment History</h3>
                    <span className="ml-auto text-xs text-muted-foreground">{history.length} operations</span>
                </div>
            </div>

            {/* Timeline */}
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                <AnimatePresence>
                    {history.map((operation, index) => (
                        <motion.div
                            key={operation.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            {/* Operation Item */}
                            <button
                                onClick={() =>
                                    setExpandedId(expandedId === operation.id ? null : operation.id)
                                }
                                className="w-full px-6 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    {/* Left: Mode & Time */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                {operation.successCount > operation.failureCount ? (
                                                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <h4 className="font-medium text-foreground text-sm">
                                                    {operation.mode.charAt(0).toUpperCase() + operation.mode.slice(1)} Mode
                                                    {' • '}
                                                    <span className="text-xs text-muted-foreground">
                                                        {operation.executedAt.toLocaleTimeString()}
                                                    </span>
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {operation.successCount} successful
                                                    {operation.failureCount > 0 ? `, ${operation.failureCount} failed` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Stats & Chevron */}
                                    <div className="flex items-center gap-4 ml-4">
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                {operation.successCount}/{operation.taskCount}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {Math.round((operation.successCount / operation.taskCount) * 100)}% success
                                            </div>
                                        </div>

                                        <motion.div
                                            animate={{ rotate: expandedId === operation.id ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                        </motion.div>
                                    </div>
                                </div>
                            </button>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {expandedId === operation.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/30 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
                                            {/* Settings Info */}
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground mb-1">Mode</p>
                                                    <p className="font-medium text-foreground capitalize">{operation.mode}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground mb-1">Risk Tolerance</p>
                                                    <p className="font-medium text-foreground capitalize">
                                                        {operation.riskTolerance}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Results Sample */}
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-2 font-medium">First 3 Results:</p>
                                                <div className="space-y-1 text-xs">
                                                    {operation.results.slice(0, 3).map((result) => (
                                                        <div key={result.taskId} className="flex items-center justify-between">
                                                            <span className="truncate text-muted-foreground">{result.taskTitle}</span>
                                                            <span
                                                                className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ml-2 ${result.status === 'success'
                                                                        ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                                                                        : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300'
                                                                    }`}
                                                            >
                                                                {result.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </Card>
    );
}