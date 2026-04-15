import { motion } from 'framer-motion';
import { Users, AlertTriangle } from 'lucide-react';
import { AIsuggestion } from '@/types/index';

interface AlternativeSuggestionsProps {
    suggestions: AIsuggestion[];
    onSelect: (suggestion: AIsuggestion) => void;
    selectedId?: string;
}

export function AlternativeSuggestions({
    suggestions,
    onSelect,
    selectedId,
}: AlternativeSuggestionsProps) {
    if (suggestions.length <= 1) return null;

    const alternatives = suggestions.slice(1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-neutral-700 bg-neutral-900/30 p-6 backdrop-blur-sm"
        >
            <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-50">Alternative Suggestions</h3>
            </div>

            <div className="space-y-3">
                {alternatives.map((suggestion, index) => {
                    const getWorkloadColor = (projected: number) => {
                        if (projected < 20) return 'bg-green-500/10 border-green-500/20';
                        if (projected < 35) return 'bg-yellow-500/10 border-yellow-500/20';
                        if (projected < 50) return 'bg-orange-500/10 border-orange-500/20';
                        return 'bg-red-500/10 border-red-500/20';
                    };

                    const getWorkloadText = (projected: number) => {
                        if (projected < 20) return 'text-green-500';
                        if (projected < 35) return 'text-yellow-500';
                        if (projected < 50) return 'text-orange-500';
                        return 'text-red-500';
                    };

                    return (
                        <motion.button
                            key={suggestion.employee.id}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => onSelect(suggestion)}
                            className={`w-full rounded-lg border p-4 transition-all ${selectedId === suggestion.employee.id
                                    ? 'border-blue-600/50 bg-blue-600/10'
                                    : `${getWorkloadColor(suggestion.analysis.projectedWorkload)} hover:border-neutral-600`
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <img
                                        src={suggestion.employee.avatar}
                                        alt={suggestion.employee.name}
                                        className="h-10 w-10 rounded-full border border-neutral-700"
                                    />
                                    <div className="text-left">
                                        <p className="font-medium text-neutral-50">{suggestion.employee.name}</p>
                                        <p className="text-xs text-neutral-400 truncate">
                                            {suggestion.analysis.currentWorkload} → {suggestion.analysis.projectedWorkload} pts
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <span className={`text-xs font-semibold ${getWorkloadText(suggestion.analysis.projectedWorkload)}`}>
                                        #{suggestion.rank}
                                    </span>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-yellow-600/10 border border-yellow-600/20 p-3">
                <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-200">
                    Selecting alternatives may increase their workload. Choose wisely to maintain team balance.
                </p>
            </div>
        </motion.div>
    );
}