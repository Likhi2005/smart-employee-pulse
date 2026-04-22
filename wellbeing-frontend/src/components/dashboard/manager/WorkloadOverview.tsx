import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, AlertCircle, CheckCircle2, Clock, Users } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { WorkloadSummary, TrendData } from '@/services/workloadService'

interface WorkloadOverviewProps {
    summary: WorkloadSummary
    trends: TrendData[]
}

export const WorkloadOverview = memo(function WorkloadOverview({ summary, trends }: WorkloadOverviewProps) {
    // Mini sparkline data for completion rate trend
    const sparklineData = useMemo(() => {
        if (trends.length === 0) return []
        return trends.slice(-7).map(t => ({
            day: t.date.slice(-2),
            rate: t.completed > 0 ? Math.round((t.completed / (t.assigned + t.completed || 1)) * 100) : 0,
        }))
    }, [trends])

    const metrics = [
        {
            label: 'Total Employees',
            value: summary.totalEmployees,
            icon: Users,
            color: 'from-blue-500/10 to-blue-500/5',
            textColor: 'text-blue-400',
            borderColor: 'border-blue-500/20',
        },
        {
            label: 'Active Tasks',
            value: summary.activeTasks,
            icon: Clock,
            color: 'from-amber-500/10 to-amber-500/5',
            textColor: 'text-amber-400',
            borderColor: 'border-amber-500/20',
        },
        {
            label: 'Completion Rate',
            value: `${summary.completionRate}%`,
            icon: CheckCircle2,
            color: 'from-green-500/10 to-green-500/5',
            textColor: 'text-green-400',
            borderColor: 'border-green-500/20',
        },
        {
            label: 'Overloaded',
            value: summary.overloadedEmployees,
            icon: AlertCircle,
            color: 'from-red-500/10 to-red-500/5',
            textColor: 'text-red-400',
            borderColor: 'border-red-500/20',
        },
        {
            label: 'Avg Workload',
            value: summary.avgWorkload.toFixed(1),
            icon: TrendingUp,
            color: 'from-cyan-500/10 to-cyan-500/5',
            textColor: 'text-cyan-400',
            borderColor: 'border-cyan-500/20',
        },
    ]

    return (
        <div className="space-y-6">
            {/* Executive KPI Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-4 lg:grid-cols-5 md:grid-cols-2"
            >
                {metrics.map((metric, idx) => {
                    const Icon = metric.icon
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`rounded-lg border ${metric.borderColor} bg-gradient-to-br ${metric.color} p-5 backdrop-blur-sm hover:shadow-lg transition-shadow`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-neutral-400">{metric.label}</p>
                                    <p className={`mt-2 text-2xl font-bold ${metric.textColor}`}>{metric.value}</p>
                                </div>
                                <Icon className={`h-5 w-5 ${metric.textColor} opacity-60`} />
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* Completion Rate Trend */}
            {sparklineData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-black/50 p-6 backdrop-blur-sm"
                >
                    <h3 className="mb-4 text-sm font-semibold text-neutral-50 uppercase tracking-wide">
                        7-Day Completion Rate Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={sparklineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="day" stroke="#666" style={{ fontSize: '12px' }} />
                            <YAxis hide />
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
                                dataKey="rate"
                                stroke="#10b981"
                                dot={false}
                                isAnimationActive={true}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            )}

            {/* Workload Distribution Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-3 gap-4"
            >
                {[
                    {
                        label: 'Healthy',
                        value: summary.workloadDistribution.low,
                        color: 'from-green-500/10 to-green-500/5',
                        textColor: 'text-green-400',
                        borderColor: 'border-green-500/20',
                    },
                    {
                        label: 'Elevated',
                        value: summary.workloadDistribution.medium,
                        color: 'from-amber-500/10 to-amber-500/5',
                        textColor: 'text-amber-400',
                        borderColor: 'border-amber-500/20',
                    },
                    {
                        label: 'Critical',
                        value: summary.workloadDistribution.high,
                        color: 'from-red-500/10 to-red-500/5',
                        textColor: 'text-red-400',
                        borderColor: 'border-red-500/20',
                    },
                ].map((dist, idx) => (
                    <div
                        key={idx}
                        className={`rounded-lg border ${dist.borderColor} bg-gradient-to-br ${dist.color} p-4 text-center backdrop-blur-sm`}
                    >
                        <p className="text-xs uppercase tracking-wide text-neutral-400">{dist.label}</p>
                        <p className={`mt-2 text-3xl font-bold ${dist.textColor}`}>{dist.value}</p>
                    </div>
                ))}
            </motion.div>
        </div>
    )
})
