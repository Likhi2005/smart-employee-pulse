import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square } from 'lucide-react';
import { Card } from '../../../ui/Card';
import { Task } from '../../../../types/tasks';
import TaskPriorityBadge from '../TaskPriorityBadge';
import TaskStatusBadge from '../TaskStatusBadge';

interface PendingTasksListProps {
    tasks: Task[];
    selectedTasks: string[];
    onToggleTask: (taskId: string) => void;
    onToggleAll: () => void;
}

export default function PendingTasksList({
    tasks,
    selectedTasks,
    onToggleTask,
    onToggleAll,
}: PendingTasksListProps) {
    if (tasks.length === 0) {
        return (
            <Card className="p-8 text-center border-dashed">
                <div className="text-muted-foreground">
                    <p className="font-medium">No pending tasks</p>
                    <p className="text-sm mt-1">All tasks have been assigned or completed</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {/* Header with Select All */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-neutral-50 dark:bg-neutral-800/50 flex items-center gap-3"
            >
                <button
                    onClick={onToggleAll}
                    className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                >
                    {selectedTasks.length === tasks.length ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : selectedTasks.length > 0 ? (
                        <div className="w-5 h-5 bg-blue-600 dark:bg-blue-400 rounded border-2 border-blue-600 dark:border-blue-400 flex items-center justify-center">
                            <div className="w-1 h-3 bg-white" />
                        </div>
                    ) : (
                        <Square className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                    )}
                </button>
                <span className="text-sm font-medium text-muted-foreground">
                    {selectedTasks.length} of {tasks.length} selected
                </span>
            </motion.div>

            {/* Tasks List */}
            <AnimatePresence>
                {tasks.map((task, index) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onToggleTask(task.id)}
                        className={`p-4 cursor-pointer transition-colors ${selectedTasks.includes(task.id)
                                ? 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-600'
                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleTask(task.id);
                                }}
                                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors mt-0.5"
                            >
                                {selectedTasks.includes(task.id) ? (
                                    <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                ) : (
                                    <Square className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                                )}
                            </button>

                            {/* Task Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-foreground truncate text-sm">{task.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <TaskPriorityBadge priority={task.priority} />
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                                    <span className="font-medium">{task.effort}h</span>
                                    <span className="text-neutral-400">•</span>
                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    {task.mandatory && (
                                        <>
                                            <span className="text-neutral-400">•</span>
                                            <span className="px-2 py-1 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded text-xs font-medium">
                                                Mandatory
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </Card>
    );
}