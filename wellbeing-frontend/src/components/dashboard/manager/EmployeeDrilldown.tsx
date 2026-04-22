import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle2, Clock, Target } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { EmployeeDetails, TeamMember, Team } from '@/services/workloadService'

interface EmployeeDrilldownProps {
    employee: EmployeeDetails | null
    isOpen: boolean
    onClose: () => void
    selectedEmployee?: TeamMember
    selectedTeam?: Team
}

export const EmployeeDrilldown = memo(function EmployeeDrilldown({
    employee,
    isOpen,
    onClose,
    selectedEmployee,
    selectedTeam,
}: EmployeeDrilldownProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'analytics'>('overview')

    if (!employee) return null

    const { details } = employee
    const taskPieData = Object.entries(details.taskBreakdown).map(([key, value]) => ({
        name: key,
        value,
    }))

    const priorityChartData = Object.entries(details.priorityDistribution).map(([key, value]) => ({
        name: key,
        value,
    }))

    const COLORS = {
        pending: '#f59e0b',
        'in-progress': '#3b82f6',
        completed: '#10b981',
        rejected: '#ef4444',
        low: '#10b981',
        medium: '#f59e0b',
        high: '#ef4444',
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, x: 400 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 400 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l border-neutral-800 bg-gradient-to-b from-neutral-950 to-black shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md px-6 py-4 flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-50">{details.employee.name}</h2>
                                <p className="text-sm text-neutral-400 mt-1">{details.employee.email}</p>
                                <p className="text-sm text-neutral-500 mt-1">{details.employee.department}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-neutral-900 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-neutral-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Key Metrics */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                {[
                                    {
                                        label: 'Current Workload',
                                        value: details.employee.workload.toFixed(1),
                                        icon: AlertCircle,
                                        color: 'text-cyan-400',
                                    },
                                    {
                                        label: 'Performance Score',
                                        value: `${details.employee.performanceScore}`,
                                        icon: CheckCircle2,
                                        color: 'text-green-400',
                                    },
                                    {
                                        label: 'Total Tasks',
                                        value: details.totalTasks,
                                        icon: Target,
                                        color: 'text-blue-400',
                                    },
                                    {
                                        label: 'Avg Effort',
                                        value: details.avgEffort.toFixed(1),
                                        icon: Clock,
                                        color: 'text-amber-400',
                                    },
                                ].map((metric, idx) => {
                                    const Icon = metric.icon
                                    return (
                                        <div
                                            key={idx}
                                            className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 backdrop-blur-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-neutral-400">{metric.label}</p>
                                                    <p className={`mt-2 text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                                                </div>
                                                <Icon className={`w-5 h-5 ${metric.color} opacity-60`} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </motion.div>

                            {/* Tabs */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex gap-2 border-b border-neutral-800"
                            >
                                {['overview', 'tasks', 'analytics'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`px-4 py-2 text-sm font-semibold transition-colors ${
                                            activeTab === tab
                                                ? 'border-b-2 border-cyan-500 text-cyan-400'
                                                : 'text-neutral-400 hover:text-neutral-200'
                                        }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </motion.div>

                            {/* Tab Content */}
                            <AnimatePresence mode="wait">
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <motion.div
                                        key="overview"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Task Status Breakdown */}
                                            <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 backdrop-blur-sm">
                                                <h3 className="text-sm font-semibold text-neutral-50 uppercase tracking-wide mb-4">
                                                    Task Status
                                                </h3>
                                                <ResponsiveContainer width="100%" height={200}>
                                                    <PieChart>
                                                        <Pie
                                                            data={taskPieData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={40}
                                                            outerRadius={80}
                                                            dataKey="value"
                                                            label
                                                        >
                                                            {taskPieData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#666'} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* Priority Distribution */}
                                            <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 backdrop-blur-sm">
                                                <h3 className="text-sm font-semibold text-neutral-50 uppercase tracking-wide mb-4">
                                                    By Priority
                                                </h3>
                                                <ResponsiveContainer width="100%" height={200}>
                                                    <BarChart data={priorityChartData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                        <XAxis dataKey="name" stroke="#666" style={{ fontSize: '12px' }} />
                                                        <YAxis hide />
                                                        <Tooltip />
                                                        <Bar dataKey="value" fill="#3b82f6" isAnimationActive={true} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Status Breakdown */}
                                        <div className="grid grid-cols-4 gap-2">
                                            {Object.entries(details.taskBreakdown).map(([status, count]) => (
                                                <div
                                                    key={status}
                                                    className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3 text-center backdrop-blur-sm"
                                                >
                                                    <p className="text-xs uppercase tracking-wide text-neutral-400">{status}</p>
                                                    <p className="mt-1 text-2xl font-bold text-neutral-50">{count}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Tasks Tab */}
                                {activeTab === 'tasks' && (
                                    <motion.div
                                        key="tasks"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-2 max-h-96 overflow-y-auto"
                                    >
                                        {details.tasks.length > 0 ? (
                                            details.tasks.map((task, idx) => (
                                                <motion.div
                                                    key={task._id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.02 }}
                                                    className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3 backdrop-blur-sm hover:bg-neutral-900/60 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-neutral-50 truncate">{task.title}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span
                                                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                                                        task.priority === 'high'
                                                                            ? 'bg-red-500/20 text-red-400'
                                                                            : task.priority === 'medium'
                                                                              ? 'bg-yellow-500/20 text-yellow-400'
                                                                              : 'bg-green-500/20 text-green-400'
                                                                    }`}
                                                                >
                                                                    {task.priority}
                                                                </span>
                                                                <span className="text-xs text-neutral-400">Effort: {task.effort}</span>
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                                                                task.status === 'completed'
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : task.status === 'in-progress'
                                                                      ? 'bg-blue-500/20 text-blue-400'
                                                                      : task.status === 'rejected'
                                                                        ? 'bg-red-500/20 text-red-400'
                                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                            }`}
                                                        >
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6">
                                                <p className="text-neutral-400">No tasks assigned</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Analytics Tab */}
                                {activeTab === 'analytics' && (
                                    <motion.div
                                        key="analytics"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 backdrop-blur-sm">
                                            <h3 className="text-sm font-semibold text-neutral-50 uppercase tracking-wide mb-4">
                                                Priority Distribution
                                            </h3>
                                            <ResponsiveContainer width="100%" height={250}>
                                                <BarChart data={priorityChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                    <XAxis dataKey="name" stroke="#666" />
                                                    <YAxis stroke="#666" />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#1a1a1a',
                                                            border: '1px solid #404040',
                                                        }}
                                                    />
                                                    <Bar dataKey="value" fill="#8b5cf6" isAnimationActive={true} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 backdrop-blur-sm text-center">
                                                <p className="text-xs uppercase tracking-wide text-neutral-400">Total Tasks</p>
                                                <p className="mt-2 text-3xl font-bold text-neutral-50">{details.totalTasks}</p>
                                            </div>
                                            <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 backdrop-blur-sm text-center">
                                                <p className="text-xs uppercase tracking-wide text-neutral-400">Completion %</p>
                                                <p className="mt-2 text-3xl font-bold text-green-400">
                                                    {details.totalTasks > 0
                                                        ? Math.round(
                                                              ((details.taskBreakdown.completed || 0) / details.totalTasks) * 100,
                                                          )
                                                        : 0}
                                                    %
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
})
