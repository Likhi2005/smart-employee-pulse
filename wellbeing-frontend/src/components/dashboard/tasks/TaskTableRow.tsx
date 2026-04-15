'use client';

import { Task } from '@/types/tasks';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface TaskTableRowProps {
    task: Task;
    isSelected: boolean;
    onSelect: (taskId: string) => void;
    isLast: boolean;
}

export default function TaskTableRow({
    task,
    isSelected,
    onSelect,
    isLast
}: TaskTableRowProps) {
    return (
        <div
            onClick={() => onSelect(task.id)}
            className={`
        flex items-center gap-0 cursor-pointer transition-colors
        ${isSelected ? 'bg-blue-600/10 border-l-2 border-l-blue-600' : 'hover:bg-neutral-800/50 border-l-2 border-l-transparent'}
      `}
        >
            {/* Task Name & Description */}
            <div className="px-4 py-4 text-sm font-medium text-foreground flex-none" style={{ width: '30%' }}>
                <p className="truncate">{task.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{task.description}</p>
            </div>

            {/* Priority */}
            <div className="px-4 py-4 flex-none" style={{ width: '12%' }}>
                <TaskPriorityBadge priority={task.priority} />
            </div>

            {/* Status */}
            <div className="px-4 py-4 flex-none" style={{ width: '12%' }}>
                <TaskStatusBadge status={task.status} />
            </div>

            {/* Assigned To */}
            <div className="px-4 py-4 text-sm text-muted-foreground flex-none" style={{ width: '18%' }}>
                {task.assignedTo ? (
                    <span className="text-foreground">{task.assignedTo}</span>
                ) : (
                    <span className="text-xs px-2 py-1 bg-neutral-800 text-neutral-400 rounded">Unassigned</span>
                )}
            </div>

            {/* Due Date */}
            <div className="px-4 py-4 text-sm text-muted-foreground flex-none" style={{ width: '14%' }}>
                {format(new Date(task.dueDate), 'MMM dd, yyyy')}
            </div>

            {/* Effort */}
            <div className="px-4 py-4 text-sm text-foreground font-medium flex-none" style={{ width: '10%' }}>
                {task.effort}h
            </div>

            {/* Mandatory */}
            <div className="px-4 py-4 text-sm flex-none" style={{ width: '8%' }}>
                {task.isMandatory && (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded font-medium">
                        Required
                    </span>
                )}
            </div>

            {/* Expand Indicator */}
            <div className="px-4 py-4 flex-shrink-0">
                <ChevronRight
                    className={`w-4 h-4 text-muted-foreground transition-transform ${isSelected ? 'rotate-90' : ''
                        }`}
                />
            </div>
        </div>
    );
}