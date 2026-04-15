import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { Task } from '@/types/index';

interface QuickStatsBarProps {
    tasks: Task[];
}

export function QuickStatsBar({ tasks }: QuickStatsBarProps) {
    const stats = {
        total: tasks.length,
        pending: tasks.filter((t) => t.status === 'pending').length,
        assigned: tasks.filter((t) => t.status === 'assigned').length,
        highPriority: tasks.filter((t) => t.priority === 'high').length,
        completed: tasks.filter((t) => t.status === 'completed').length,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-6"
        >
            <StatCard icon={ListTodo} label="Total Tasks" value={stats.total} variant="default" />
            <StatCard icon={Clock} label="Pending" value={stats.pending} variant="warning" />
            <StatCard icon={AlertCircle} label="High Priority" value={stats.highPriority} variant="danger" />
            <StatCard icon={CheckCircle} label="Assigned" value={stats.assigned} variant="info" />
            <StatCard icon={CheckCircle} label="Completed" value={stats.completed} variant="success" />
        </motion.div>
    );
}

interface StatCardProps {
    icon: React.ComponentType<{ className: string }>;
    label: string;
    value: number;
    variant: 'default' | 'warning' | 'danger' | 'info' | 'success';
}

const variantStyles = {
    default: 'bg-blue-500/10 border-blue-500/20',
    warning: 'bg-yellow-500/10 border-yellow-500/20',
    danger: 'bg-red-500/10 border-red-500/20',
    info: 'bg-cyan-500/10 border-cyan-500/20',
    success: 'bg-green-500/10 border-green-500/20',
};

const iconStyles = {
    default: 'text-blue-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-cyan-600',
    success: 'text-green-600',
};

function StatCard({ icon: Icon, label, value, variant }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-lg border p-4 backdrop-blur-sm transition-all ${variantStyles[variant]}`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-neutral-400">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-neutral-50">{value}</p>
                </div>
                <Icon className={`h-6 w-6 ${iconStyles[variant]}`} />
            </div>
        </motion.div>
    );
}