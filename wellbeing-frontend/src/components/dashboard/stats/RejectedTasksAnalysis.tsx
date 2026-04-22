import { memo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface TaskStats {
    total: number
    pending: number
    accepted: number
    completed: number
    rejected: number
}

interface RejectedTasksAnalysisProps {
    taskStats: TaskStats
}

export const RejectedTasksAnalysis = memo(function RejectedTasksAnalysis({ taskStats }: RejectedTasksAnalysisProps) {
    if (!taskStats) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="rounded-lg border border-red-500/20 bg-gradient-to-br from-red-500/10 to-black/50 p-6 backdrop-blur-sm"
            >
                <div className="mb-4 flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-neutral-50">Task Rejection Analysis</h3>
                </div>
                <div className="text-center py-8 text-neutral-500">No rejection data available</div>
            </motion.div>
        )
    }

    const rejectionRate = taskStats.total > 0 ? Math.round((taskStats.rejected / taskStats.total) * 100) : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-lg border border-red-500/20 bg-gradient-to-br from-red-500/10 to-black/50 p-6 backdrop-blur-sm"
        >
            <div className="mb-6 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-semibold text-neutral-50">Task Rejection Analysis</h3>
            </div>

            <div className="mb-6 rounded-lg bg-red-500/5 p-4 text-center border border-red-500/20">
                <p className="text-xs text-red-300">TOTAL REJECTIONS</p>
                <p className="mt-2 text-3xl font-bold text-red-400">{taskStats.rejected}</p>
                <p className="mt-1 text-xs text-red-300">{rejectionRate}% of all tasks</p>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm text-neutral-300">Acceptance Rate</p>
                        <span className="text-xs font-semibold text-green-400">
                            {Math.round(((taskStats.accepted + taskStats.completed) / taskStats.total) * 100) || 0}%
                        </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-800">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(((taskStats.accepted + taskStats.completed) / taskStats.total) * 100) || 0}%` }}
                            transition={{ delay: 0.3 }}
                            className="h-full rounded-full bg-green-500"
                        ></motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
})