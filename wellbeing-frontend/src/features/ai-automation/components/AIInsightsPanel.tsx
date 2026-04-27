import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, Info, Loader2 } from 'lucide-react';

interface AIInsight {
    title: string;
    description: string;
    recommendation: string;
}

interface AIInsightsPanelProps {
    insights: AIInsight[];
    loading?: boolean;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights, loading }) => {
    return (
        <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-100">AI Intelligence Insights</h3>
                </div>
                {loading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
            </div>

            <div className="flex-1 space-y-4">
                <AnimatePresence mode="popLayout">
                    {insights.length > 0 ? (
                        insights.map((insight, idx) => (
                            <motion.div
                                key={insight.title}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-4 rounded-lg bg-gray-900/40 border border-gray-700/30 hover:border-blue-500/30 transition-colors group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1 bg-blue-500/10 rounded border border-blue-500/20 text-blue-400">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-gray-100 group-hover:text-blue-400 transition-colors">
                                            {insight.title}
                                        </h4>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {insight.description}
                                        </p>
                                        <div className="mt-3 flex items-start gap-2 p-2 bg-blue-500/5 rounded border border-blue-500/10">
                                            <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5" />
                                            <p className="text-xs text-blue-300 font-medium italic">
                                                {insight.recommendation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : !loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="p-4 bg-gray-800/50 rounded-full mb-4">
                                <AlertCircle className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-500 text-sm">No new insights generated yet.</p>
                            <p className="text-gray-600 text-xs mt-1">AI engine is processing team data...</p>
                        </div>
                    ) : null}
                </AnimatePresence>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    Powered by Gemini 1.5 Pro
                </span>
                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    View Full Analysis
                </button>
            </div>
        </div>
    );
};
