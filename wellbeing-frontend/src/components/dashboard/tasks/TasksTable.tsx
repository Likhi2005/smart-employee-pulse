'use client';

import { Task } from '@/types/tasks';
import TaskTableRow from './TaskTableRow';
import TaskTableHeader from './TaskTableHeader';

interface TasksTableProps {
    tasks: Task[];
    selectedTaskId: string | null;
    onSelectTask: (taskId: string) => void;
}

export default function TasksTable({
    tasks,
    selectedTaskId,
    onSelectTask
}: TasksTableProps) {
    return (
        <div className="border border-neutral-800 rounded-lg overflow-hidden bg-card">
            {/* Header */}
            <TaskTableHeader />

            {/* Body */}
            <div className="divide-y divide-neutral-800">
                {tasks.map((task, index) => (
                    <TaskTableRow
                        key={task.id}
                        task={task}
                        isSelected={selectedTaskId === task.id}
                        onSelect={onSelectTask}
                        isLast={index === tasks.length - 1}
                    />
                ))}
            </div>
        </div>
    );
}