import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { useAutoAssign } from '../../../../hooks/useAutoAssign';
import { useAuth } from '../../../../hooks/useAuth';
import { Task, BulkAssignMode, RiskTolerance } from '../../../../types/tasks';
import AutoAssignSettings from './AutoAssignSettings';
import PendingTasksList from './PendingTasksList';
import BulkAssignButton from './BulkAssignButton';
import AutoAssignedResultsTable from './AutoAssignedResultsTable';
import AssignmentUndoModal from './AssignmentUndoModal';
import AutoAssignHistory from './AutoAssignHistory';

export default function AutoAssignView() {
    const { user } = useAuth();
    const {
        getPendingTasks,
        executeBulkAssignment,
        undoLastOperation,
        lastOperation,
        operationHistory,
        isProcessing,
        error,
    } = useAutoAssign();

    const [mode, setMode] = useState<BulkAssignMode>('balanced');
    const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
    const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [showUndoModal, setShowUndoModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch pending tasks on mount
    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            const tasks = await getPendingTasks();
            setPendingTasks(tasks);
            // Auto-select all pending tasks
            setSelectedTasks(tasks.map((t) => t.id));
        };

        fetchTasks();
    }, [getPendingTasks]);

    const handleBulkAssign = async () => {
        if (selectedTasks.length === 0) {
            alert('Please select at least one task');
            return;
        }

        const tasksToAssign = pendingTasks.filter((t) => selectedTasks.includes(t.id));
        await executeBulkAssignment(tasksToAssign, mode, riskTolerance, user?.id || '');
        setShowResults(true);
    };

    const handleUndo = async () => {
        const success = await undoLastOperation();
        if (success) {
            setShowUndoModal(false);
            setShowResults(false);
            // Refresh pending tasks
            const tasks = await getPendingTasks();
            setPendingTasks(tasks);
        }
    };

    const toggleTaskSelection = (taskId: string) => {
        setSelectedTasks((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
        );
    };

    const toggleAllTasks = () => {
        if (selectedTasks.length === pendingTasks.length) {
            setSelectedTasks([]);
        } else {
            setSelectedTasks(pendingTasks.map((t) => t.id));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground">Loading pending tasks...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-foreground">Auto-Assign Tasks</h1>
                <p className="text-muted-foreground mt-2">
                    Automatically assign pending tasks to employees based on workload and skills
                </p>
            </motion.div>

            {/* Error Alert */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-red-900 dark:text-red-100">Error</h3>
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* Settings & Results Layout */}
            {!showResults ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Settings */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <AutoAssignSettings mode={mode} setMode={setMode} riskTolerance={riskTolerance} setRiskTolerance={setRiskTolerance} />
                    </motion.div>

                    {/* Right: Task Selection & Action */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 space-y-4"
                    >
                        {/* Process Info Card */}
                        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/10 dark:to-blue-950/5 border-blue-200 dark:border-blue-900/40">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium text-blue-900 dark:text-blue-100">Bulk Assignment Process</h3>
                                    <ol className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1 ml-2 list-decimal">
                                        <li>Review pending tasks below</li>
                                        <li>Configure assignment mode and risk tolerance</li>
                                        <li>Click "Execute Auto-Assign" to process</li>
                                        <li>Review results and undo if needed</li>
                                    </ol>
                                </div>
                            </div>
                        </Card>

                        {/* Tasks List */}
                        <PendingTasksList
                            tasks={pendingTasks}
                            selectedTasks={selectedTasks}
                            onToggleTask={toggleTaskSelection}
                            onToggleAll={toggleAllTasks}
                        />

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedTasks([])}
                                disabled={selectedTasks.length === 0 || isProcessing}
                            >
                                Deselect All
                            </Button>

                            <BulkAssignButton
                                selectedCount={selectedTasks.length}
                                totalCount={pendingTasks.length}
                                isProcessing={isProcessing}
                                onExecute={handleBulkAssign}
                            />
                        </div>
                    </motion.div>
                </div>
            ) : (
                /* Results View */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Results Summary */}
                    {lastOperation && (
                        <div className="grid grid-cols-3 gap-4">
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                className="p-4 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/40 rounded-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Successful</p>
                                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                            {lastOperation.successCount}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/40 rounded-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    <div>
                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">Failed</p>
                                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">{lastOperation.failureCount}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="p-4 bg-blue-50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/40 rounded-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Processed</p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            {lastOperation.taskCount}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Results Table */}
                    {lastOperation && <AutoAssignedResultsTable operation={lastOperation} />}

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-between">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowResults(false);
                                const tasks = getPendingTasks();
                                tasks.then((t) => setPendingTasks(t));
                            }}
                        >
                            Back to Settings
                        </Button>

                        <div className="flex gap-3">
                            {lastOperation && (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowUndoModal(true)}
                                    disabled={isProcessing}
                                    className="text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/40"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Undo Assignment
                                </Button>
                            )}

                            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                                Save Results
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* History Section */}
            {operationHistory.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <AutoAssignHistory history={operationHistory} />
                </motion.div>
            )}

            {/* Undo Confirmation Modal */}
            {showUndoModal && (
                <AssignmentUndoModal
                    operation={lastOperation!}
                    isProcessing={isProcessing}
                    onConfirm={handleUndo}
                    onCancel={() => setShowUndoModal(false)}
                />
            )}
        </div>
    );
}