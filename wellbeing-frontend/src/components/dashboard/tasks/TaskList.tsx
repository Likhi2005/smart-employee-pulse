import { motion } from 'framer-motion';
import { Task } from '@/types/index';
import { TaskItem } from './TaskItem';

interface TaskListProps {
    tasks: Task[];
    selectedTaskId?: string;
    onTaskSelect: (task: Task) => void;
    onTaskAction: (taskId: string, action: 'assign' | 'complete' | 'reject') => void;
    isLoading?: boolean;
}

export function TaskList({
    tasks,
    selectedTaskId,
    onTaskSelect,
    onTaskAction,
    isLoading = false,
}: TaskListProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-neutral-400">Loading tasks...</div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-dashed border-neutral-700 p-12 text-center"
            >
                <p className="text-neutral-400">No tasks found. Create one to get started!</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
        >
            {tasks.map((task, index) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onSelect={onTaskSelect}
                    onAction={(action) => onTaskAction(task.id, action)}
                    index={index}
                />
            ))}
        </motion.div>
    );
}