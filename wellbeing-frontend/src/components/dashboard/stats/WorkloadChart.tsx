import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { workloadChartData } from '@/data/managerStatsData';

const getWorkloadColor = (level: string) => {
    const colors: Record<string, string> = {
        low: '#10b981',
        medium: '#f59e0b',
        high: '#ef4444',
        critical: '#991b1b',
    };
    return colors[level] || '#3b82f6';
};

export function WorkloadChart() {
    const chartData = workloadChartData.map((emp) => ({
        ...emp,
        fill: getWorkloadColor(emp.workloadLevel),
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-black/50 p-6 backdrop-blur-sm"
        >
            <h3 className="mb-6 text-lg font-semibold text-neutral-50">Employee Workload Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis dataKey="name" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                        }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="tasks" fill="#3b82f6" name="Active Tasks" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="completed" fill="#10b981" name="Completed Tasks" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                    <span className="text-neutral-400">Low Workload</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-yellow-500"></div>
                    <span className="text-neutral-400">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-red-500"></div>
                    <span className="text-neutral-400">High Workload</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-red-900"></div>
                    <span className="text-neutral-400">Critical</span>
                </div>
            </div>
        </motion.div>
    );
}