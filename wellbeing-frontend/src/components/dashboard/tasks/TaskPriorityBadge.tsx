'use client';

import { Task } from '@/types/tasks';

interface TaskPriorityBadgeProps {
    priority: Task['priority'];
}

const priorityConfig = {
    low: {
        bg: 'bg-neutral-800',
        text: 'text-neutral-300',
        dot: 'bg-neutral-500',
        label: 'Low'
    },
    medium: {
        bg: 'bg-blue-900/40',
        text: 'text-blue-300',
        dot: 'bg-blue-500',
        label: 'Medium'
    },
    high: {
        bg: 'bg-orange-900/40',
        text: 'text-orange-300',
        dot: 'bg-orange-500',
        label: 'High'
    },
    critical: {
        bg: 'bg-red-900/40',
        text: 'text-red-300',
        dot: 'bg-red-500',
        label: 'Critical'
    }
};

export default function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
    const config = priorityConfig[priority];

    return (
        <div className={`flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded ${config.bg} ${config.text} w-fit`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </div>
    );
}