import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
} from 'recharts'
import type { TrendData } from '@/services/workloadService'

interface WorkloadTrendsProps {
    trends: TrendData[]
    days?: number
}

export const WorkloadTrends = memo(function WorkloadTrends({ trends, days = 30 }: WorkloadTrendsProps) {
    // Aggregate data if more than 30 points
    const displayData = useMemo(() => {
        if (trends.length <= 30) return trends

        const aggregated = []
        const step = Math.ceil(trends.length / 30)
        for (let i = 0; i < trends.length; i += step) {
            const chunk = trends.slice(i, i + step)
            const avgAssigned = chunk.reduce((sum, t) => sum + t.assigned, 0) / chunk.length
            const avgCompleted = chunk.reduce((sum, t) => sum + t.completed, 0) / chunk.length
            aggregated.push({
                date: chunk[0].date,
                assigned: Math.round(avgAssigned),
                completed: Math.round(avgCompleted),
                activeEmployees: chunk[chunk.length - 1].activeEmployees,
            })
        }
        return aggregated
    }, [trends])

    // Calculate completion rate for each day
    const trendDataWithRate = useMemo(() => {
        return displayData.map(t => ({
            ...t,
            completionRate: t.assigned > 0 ? Math.round((t.completed / (t.assigned + t.completed || 1)) * 100) : 0,
        }))
    }, [displayData])

    // Calculate statistics
    const stats = useMemo(() => {
        if (displayData.length === 0) return { avgAssigned: 0, avgCompleted: 0, totalAssigned: 0, totalCompleted: 0 }

        const totalAssigned = displayData.reduce((sum, t) => sum + t.assigned, 0)
        const totalCompleted = displayData.reduce((sum, t) => sum + t.completed, 0)
        return {
            avgAssigned: Math.round(totalAssigned / displayData.length),
            avgCompleted: Math.round(totalCompleted / displayData.length),
            totalAssigned,
            totalCompleted,
        }
    }, [displayData])

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Statistics Overview */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-4 md:grid-cols-4"
            >
                {[
                    {
                        label: 'Total Assigned',
                        value: stats.totalAssigned,
                        color: 'from-blue-500/10 to-blue-500/5',
                        textColor: 'text-blue-400',
                        borderColor: 'border-blue-500/20',
                    },
                    {
                        label: 'Total Completed',
                        value: stats.totalCompleted,
                        color: 'from-green-500/10 to-green-500/5',
                        textColor: 'text-green-400',
                        borderColor: 'border-green-500/20',
                    },
                    {
                        label: 'Avg Assigned/Day',
                        value: stats.avgAssigned,
                        color: 'from-cyan-500/10 to-cyan-500/5',
                        textColor: 'text-cyan-400',
                        borderColor: 'border-cyan-500/20',
                    },
                    {
                        label: 'Avg Completed/Day',
                        value: stats.avgCompleted,
                        color: 'from-emerald-500/10 to-emerald-500/5',
                        textColor: 'text-emerald-400',
                        borderColor: 'border-emerald-500/20',
                    },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        className={`rounded-lg border ${stat.borderColor} bg-gradient-to-br ${stat.color} p-4 backdrop-blur-sm`}
                    >
                        <p className="text-xs uppercase tracking-wide text-neutral-400">{stat.label}</p>
                        <p className={`mt-2 text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Assigned vs Completed Trend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-sm"
            >
                <h3 className="mb-4 text-sm font-semibold text-neutral-50 uppercase tracking-wide">
                    Task Assignment & Completion Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={trendDataWithRate} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                            interval={Math.floor(displayData.length / 7) || 0}
                        />
                        <YAxis yAxisId="left" stroke="#666" style={{ fontSize: '12px' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#666" style={{ fontSize: '12px' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #404040',
                                borderRadius: '6px',
                            }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="assigned" fill="#3b82f6" isAnimationActive={true} />
                        <Bar yAxisId="left" dataKey="completed" fill="#10b981" isAnimationActive={true} />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="completionRate"
                            stroke="#f59e0b"
                            isAnimationActive={true}
                            name="Completion Rate (%)"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Active Employees Trend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-sm"
            >
                <h3 className="mb-4 text-sm font-semibold text-neutral-50 uppercase tracking-wide">
                    Active Team Members
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendDataWithRate} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                            interval={Math.floor(displayData.length / 7) || 0}
                        />
                        <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #404040',
                                borderRadius: '6px',
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="activeEmployees"
                            stroke="#8b5cf6"
                            isAnimationActive={true}
                            dot={false}
                            strokeWidth={2}
                            name="Active Employees"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Completion Rate Sparkline */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-sm"
            >
                <h3 className="mb-4 text-sm font-semibold text-neutral-50 uppercase tracking-wide">
                    Completion Rate Trend
                </h3>
                <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={trendDataWithRate} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                            interval={Math.floor(displayData.length / 7) || 0}
                        />
                        <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #404040',
                                borderRadius: '6px',
                            }}
                            formatter={(value) => `${value}%`}
                        />
                        <Line
                            type="monotone"
                            dataKey="completionRate"
                            stroke="#10b981"
                            isAnimationActive={true}
                            dot={false}
                            strokeWidth={2}
                            fill="#10b9811a"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>
        </motion.div>
    )
})
