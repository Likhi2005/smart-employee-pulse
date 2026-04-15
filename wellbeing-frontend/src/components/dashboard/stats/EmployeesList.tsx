import { motion } from 'framer-motion';
import { Users, AlertCircle } from 'lucide-react';
import { employeesData, Employee } from '@/data/managerStatsData';

interface EmployeesListProps {
    type: 'overloaded' | 'available';
}

const getWorkloadBadgeColor = (level: string) => {
    const colors: Record<string, string> = {
        low: 'bg-green-500/10 text-green-600 border-green-500/20',
        medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        high: 'bg-red-500/10 text-red-600 border-red-500/20',
        critical: 'bg-red-900/20 text-red-400 border-red-900/40',
    };
    return colors[level] || 'bg-neutral-700/10 text-neutral-400';
};

const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
        available: 'bg-green-500',
        busy: 'bg-yellow-500',
        offline: 'bg-neutral-600',
    };
    return colors[status] || 'bg-neutral-600';
};

export function EmployeesList({ type }: EmployeesListProps) {
    const filteredEmployees = employeesData.filter((emp) => {
        if (type === 'overloaded') {
            return emp.workloadLevel === 'high' || emp.workloadLevel === 'critical';
        }
        return emp.workloadLevel === 'low' || emp.workloadLevel === 'medium';
    });

    const title = type === 'overloaded' ? 'Overloaded Employees' : 'Available Employees';
    const icon = type === 'overloaded' ? AlertCircle : Users;
    const Icon = icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: type === 'overloaded' ? 0.4 : 0.5 }}
            className="rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-black/50 p-6 backdrop-blur-sm"
        >
            <div className="mb-6 flex items-center gap-2">
                <Icon className="h-5 w-5 text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-50">{title}</h3>
                {filteredEmployees.length > 0 && (
                    <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/20 text-xs font-medium text-blue-400">
                        {filteredEmployees.length}
                    </span>
                )}
            </div>

            <div className="space-y-3">
                {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp, idx) => (
                        <motion.div
                            key={emp.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="flex items-center justify-between rounded-lg border border-neutral-700/50 bg-neutral-800/50 p-4 hover:bg-neutral-800/80 transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <img
                                    src={emp.avatar}
                                    alt={emp.name}
                                    className="h-10 w-10 rounded-full border border-neutral-700"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-50">{emp.name}</p>
                                    <p className="text-xs text-neutral-400">{emp.taskCount} tasks assigned</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border ${getWorkloadBadgeColor(emp.workloadLevel)}`}>
                                    {emp.workloadLevel.charAt(0).toUpperCase() + emp.workloadLevel.slice(1)}
                                </div>
                                <div className={`h-3 w-3 rounded-full ${getStatusBadgeColor(emp.status)}`}></div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="rounded-lg border border-dashed border-neutral-700 p-8 text-center">
                        <p className="text-sm text-neutral-400">No {type === 'overloaded' ? 'overloaded' : 'available'} employees</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}