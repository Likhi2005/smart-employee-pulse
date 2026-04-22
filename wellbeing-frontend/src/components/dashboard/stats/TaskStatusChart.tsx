import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface TaskStats {
    total: number
    pending: number
    accepted: number
    completed: number
    rejected: number
}

interface TaskStatusChartProps {
    taskStats: TaskStats
}

export const TaskStatusChart = memo(function TaskStatusChart({ taskStats }: TaskStatusChartProps) {
    if (!taskStats) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-black/50 p-6 backdrop-blur-sm"
            >
                <h3 className="mb-6 text-lg font-semibold text-neutral-50">Task Status Overview</h3>
                <div className="h-[280px] flex items-center justify-center text-neutral-500">
                    No task data available
                </div>
            </motion.div>
        )
    }

    const chartData = useMemo(() => [
        { name: 'Completed', value: taskStats.completed, color: '#10b981' },
        { name: 'In Progress', value: taskStats.accepted, color: '#3b82f6' },
        { name: 'Pending', value: taskStats.pending, color: '#f59e0b' },
        { name: 'Rejected', value: taskStats.rejected, color: '#ef4444' },
    ].filter(item => item.value > 0), [taskStats.completed, taskStats.accepted, taskStats.pending, taskStats.rejected])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-black/50 p-6 backdrop-blur-sm"
        >
            <h3 className="mb-6 text-lg font-semibold text-neutral-50">Task Status Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    )
})