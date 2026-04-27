import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface TeamWorkloadItem {
    _id: string
    fullName: string
    currentWorkload: number
}

interface WorkloadChartProps {
    teamWorkload: TeamWorkloadItem[]
}

const getWorkloadLevel = (workload: number) => {
    if (workload < 15) return 'low'
    if (workload < 25) return 'medium'
    if (workload < 35) return 'high'
    return 'critical'
}

const getWorkloadColor = (level: string) => {
    const colors: Record<string, string> = {
        low: '#10b981',
        medium: '#f59e0b',
        high: '#ef4444',
        critical: '#991b1b',
    }
    return colors[level] || '#3b82f6'
}

export const WorkloadChart = memo(function WorkloadChart({ teamWorkload }: WorkloadChartProps) {
    if (!teamWorkload || teamWorkload.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-black/50 p-6 backdrop-blur-sm"
            >
                <h3 className="mb-6 text-lg font-semibold text-neutral-50">Employee Workload Distribution</h3>
                <div className="h-[300px] flex items-center justify-center text-neutral-500">
                    No workload data available
                </div>
            </motion.div>
        )
    }

    const chartData = useMemo(() =>
        teamWorkload.map((emp) => ({
            name: emp.fullName.split(' ')[0], // First name only for space
            workload: emp.currentWorkload,
            workloadLevel: getWorkloadLevel(emp.currentWorkload),
        })), [teamWorkload]
    )

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
                    <Bar
                        dataKey="workload"
                        radius={[4, 4, 0, 0]}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getWorkloadColor(entry.workloadLevel)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                    <span className="text-neutral-400">Low (&lt;15)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-yellow-500"></div>
                    <span className="text-neutral-400">Medium (15-25)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-red-500"></div>
                    <span className="text-neutral-400">High (25-35)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-red-900"></div>
                    <span className="text-neutral-400">Critical (&gt;35)</span>
                </div>
            </div>
        </motion.div>
    )
})