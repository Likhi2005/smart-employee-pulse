import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { suggestedEmployee } from '@/data/managerStatsData';

export function SuggestionCard() {
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
                <p className="mb-4 text-xs uppercase tracking-wide text-neutral-400">Recommended Employee</p>
                <div className="mb-6 flex items-center gap-4">
                    <img
                        src={suggestedEmployee.avatar}
                        alt={suggestedEmployee.name}
                        className="h-12 w-12 rounded-full border-2 border-blue-500/30"
                    />
                    <div className="flex-1">
                        <p className="font-semibold text-neutral-50">{suggestedEmployee.name}</p>
                        <p className="text-sm text-neutral-400">{suggestedEmployee.reason}</p>
                    </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600/20 px-4 py-2.5 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 border border-blue-500/20">
                    Assign Task
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>

            <p className="mt-4 text-xs text-neutral-500">
                Based on workload analysis and productivity metrics • Updates every 30 min
            </p>
        </motion.div>
    );
}