'use client';

import { Task } from '@/types/tasks';

interface TaskStatusBadgeProps {
    status: Task['status'];
}

const statusConfig = {
    pending: {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        label: 'Pending'
    },
    assigned: {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        label: 'Assigned'
    },
    'in-progress': {
        bg: 'bg-purple-500/20',
        text: 'text-purple-400',
        label: 'In Progress'
    },
    completed: {
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-400',
        label: 'Completed'
    },
    rejected: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        label: 'Rejected'
    },
    'on-hold': {
        bg: 'bg-neutral-500/20',
        text: 'text-neutral-400',
        label: 'On Hold'
    }
};

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
}