import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    trend?: { value: number; isPositive: boolean };
    variant?: 'default' | 'success' | 'warning' | 'danger';
    index?: number;
}

const variantStyles = {
    default: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20',
    success: 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20',
    warning: 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20',
    danger: 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20',
};

const iconStyles = {
    default: 'bg-blue-500/10 text-blue-600',
    success: 'bg-green-500/10 text-green-600',
    warning: 'bg-yellow-500/10 text-yellow-600',
    danger: 'bg-red-500/10 text-red-600',
};

export function SummaryCard({
    title,
    value,
    icon: Icon,
    trend,
    variant = 'default',
    index = 0,
}: SummaryCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg border p-6 backdrop-blur-sm transition-all hover:shadow-lg ${variantStyles[variant]}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-neutral-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-neutral-50">{value}</p>
                    {trend && (
                        <p className={`mt-2 text-xs font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
                        </p>
                    )}
                </div>
                <div className={`rounded-lg p-3 ${iconStyles[variant]}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </motion.div>
    );
}