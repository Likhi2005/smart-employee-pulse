import { memo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react'

interface Alerts {
    overloadedEmployee: { name: string; workload: number; message: string } | null
    underutilizedEmployee: { name: string; workload: number; message: string } | null
}

interface SuggestionCardProps {
    alerts: Alerts
}

export const SuggestionCard = memo(function SuggestionCard({ alerts }: SuggestionCardProps) {
    if (!alerts) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-black/50 to-black/50 p-6 backdrop-blur-sm"
            >
                <div className="mb-4 flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-neutral-50">Smart Assignment</h3>
                </div>
                <div className="rounded-lg bg-neutral-900/50 p-4 text-center text-neutral-500">
                    Loading suggestions...
                </div>
            </motion.div>
        )
    }

    const suggestion = alerts.underutilizedEmployee

    if (!suggestion) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-black/50 to-black/50 p-6 backdrop-blur-sm"
            >
                <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-neutral-50">Smart Assignment</h3>
                </div>
                <div className="rounded-lg bg-neutral-900/50 p-4 text-center text-neutral-500">
                    All employees are at optimal workload
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-black/50 to-black/50 p-6 backdrop-blur-sm"
        >
            <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-neutral-50">Smart Assignment Suggestion</h3>
            </div>

            <div className="rounded-lg bg-neutral-900/50 p-4">
                <p className="mb-4 text-xs uppercase tracking-wide text-neutral-400">Recommended For New Tasks</p>
                <div className="mb-6">
                    <p className="font-semibold text-neutral-50">{suggestion.name}</p>
                    <p className="text-sm text-neutral-400">{suggestion.message}</p>
                </div>

                <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600/20 px-4 py-2.5 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 border border-blue-500/20">
                    Assign New Task
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    )
})