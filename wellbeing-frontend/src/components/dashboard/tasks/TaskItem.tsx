import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    Flag,
    Lock,
    PlayCircle,
    CheckCircle,
    XCircle,
    ChevronRight,
} from 'lucide-react';
import { Task } from '@/types/index';

interface TaskItemProps {
    task: Task;
    isSelected?: boolean;
    onSelect?: (task: Task) => void;
    onAction?: (action: 'assign' | 'complete' | 'reject') => void;
    index?: number;
}

const priorityColors = {
    low: 'bg-green-500/10 text-green-600 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    high: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const statusIcons = {
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    assigned: <PlayCircle className="h-4 w-4 text-blue-500" />,
    'in-progress': <PlayCircle className="h-4 w-4 text-blue-500" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    rejected: <XCircle className="h-4 w-4 text-red-500" />,
};

export function TaskItem({
    task,
    isSelected = false,
    onSelect,
    onAction,
    index = 0,
}: TaskItemProps) {
    const daysUntilDue = Math.ceil(
        (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const isOverdue = daysUntilDue < 0;
    const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect?.(task)}
            className={`group rounded-lg border p-4 transition-all cursor-pointer ${isSelected
                    ? 'border-blue-600/50 bg-blue-600/10'
                    : 'border-neutral-700 bg-neutral-900/30 hover:border-neutral-600 hover:bg-neutral-900/50'
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                {/* Left: Icon + Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        {statusIcons[task.status]}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-neutral-50 truncate">{task.title}</h3>
                            <p className="mt-1 text-xs text-neutral-400 truncate">{task.description}</p>
                        </div>
                    </div>

                    {/* Badges Row */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {/* Priority Badge */}
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium border ${priorityColors[task.priority]}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </span>

                        {/* Effort Badge */}
                        <span className="flex items-center gap-1 rounded-full bg-neutral-800/50 px-2.5 py-1 text-xs text-neutral-400 border border-neutral-700">
                            <Clock className="h-3 w-3" />
                            {task.effort}h
                        </span>

                        {/* Mandatory Badge */}
                        {task.isMandatory && (
                            <span className="flex items-center gap-1 rounded-full bg-red-600/10 px-2.5 py-1 text-xs text-red-400 border border-red-600/30">
                                <Lock className="h-3 w-3" />
                                Mandatory
                            </span>
                        )}

                        {/* Due Date Badge */}
                        <span
                            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border ${isOverdue
                                    ? 'bg-red-600/10 text-red-400 border-red-600/30'
                                    : isDueSoon
                                        ? 'bg-yellow-600/10 text-yellow-400 border-yellow-600/30'
                                        : 'bg-neutral-800/50 text-neutral-400 border-neutral-700'
                                }`}
                        >
                            <Calendar className="h-3 w-3" />
                            {isOverdue
                                ? 'Overdue'
                                : isDueSoon
                                    ? `Due in ${daysUntilDue}d`
                                    : `${new Date(task.dueDate).toLocaleDateString()}`}
                        </span>

                        {/* Assignee Badge */}
                        {task.assignedToName && (
                            <span className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs text-blue-400 border border-blue-600/30">
                                → {task.assignedToName}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: Action Button */}
                <motion.button
                    whileHover={{ x: 5 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (task.status === 'pending') {
                            onAction?.('assign');
                        } else if (task.status === 'assigned') {
                            onAction?.('complete');
                        }
                    }}
                    className={`flex-shrink-0 rounded-lg p-2 transition-colors ${task.status === 'pending'
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            : task.status === 'assigned'
                                ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                : 'bg-neutral-800/50 text-neutral-500'
                        }`}
                >
                    <ChevronRight className="h-5 w-5" />
                </motion.button>
            </div>
        </motion.div>
    );
}