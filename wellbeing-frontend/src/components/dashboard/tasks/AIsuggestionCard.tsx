import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, TrendingDown } from 'lucide-react';
import { AIsuggestion } from '@/types/index';

interface AISuggestionCardProps {
    suggestion: AIsuggestion;
    onAccept: (employeeId: string) => void;
    isLoading?: boolean;
}

export function AISuggestionCard({ suggestion, onAccept, isLoading = false }: AISuggestionCardProps) {
    const getWorkloadIndicator = (projected: number) => {
        if (projected < 20) return { color: 'bg-green-500', label: 'Low' };
        if (projected < 35) return { color: 'bg-yellow-500', label: 'Medium' };
        if (projected < 50) return { color: 'bg-orange-500', label: 'High' };
        return { color: 'bg-red-500', label: 'Critical' };
    };

    const workloadIndicator = getWorkloadIndicator(suggestion.analysis.projectedWorkload);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-blue-600/30 bg-gradient-to-br from-blue-600/10 to-blue-900/10 p-6 backdrop-blur-sm"
        >
            {/* Header */}
            <div className="mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-neutral-50">AI Smart Suggestion</h3>
                <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/30 text-xs font-bold text-blue-400">
                    #{suggestion.rank}
                </span>
            </div>

            {/* Employee Card */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-lg bg-neutral-900/50 border border-neutral-700 p-4 mb-4"
            >
                <div className="flex items-center gap-4">
                    <img
                        src={suggestion.employee.avatar}
                        alt={suggestion.employee.name}
                        className="h-12 w-12 rounded-full border-2 border-blue-600/30"
                    />
                    <div className="flex-1">
                        <h4 className="font-semibold text-neutral-50">{suggestion.employee.name}</h4>
                        <p className="text-xs text-neutral-400">{suggestion.employee.email}</p>
                    </div>
                </div>
            </motion.div>

            {/* Workload Analysis */}
            <div className="mb-6 space-y-3">
                <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-neutral-400">Current Workload</span>
                        <span className="font-semibold text-neutral-50">{suggestion.analysis.currentWorkload} pts</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-700">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((suggestion.analysis.currentWorkload / 60) * 100, 100)}%` }}
                            transition={{ delay: 0.3 }}
                            className="h-full rounded-full bg-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-neutral-400">+ Task Impact</span>
                        <span className="font-semibold text-orange-400">+{suggestion.analysis.taskImpact} pts</span>
                    </div>
                </div>

                <div className="border-t border-neutral-700 pt-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-neutral-400">Projected Workload</span>
                        <span className={`font-semibold ${workloadIndicator.color.replace('bg', 'text')}`}>
                            {suggestion.analysis.projectedWorkload} pts ({workloadIndicator.label})
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-700">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((suggestion.analysis.projectedWorkload / 60) * 100, 100)}%` }}
                            transition={{ delay: 0.4 }}
                            className={`h-full rounded-full ${workloadIndicator.color}`}
                        />
                    </div>
                </div>
            </div>

            {/* Reason */}
            <div className="mb-6 rounded-lg bg-blue-600/5 border border-blue-600/20 p-3">
                <p className="text-xs leading-relaxed text-neutral-300">{suggestion.analysis.reason}</p>
            </div>

            {/* Action Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => onAccept(suggestion.employee.id)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600/20 py-3 text-sm font-semibold text-blue-400 border border-blue-600/50 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <CheckCircle className="h-4 w-4" />
                {isLoading ? 'Assigning...' : 'Accept This Recommendation'}
            </motion.button>
        </motion.div>
    );
}