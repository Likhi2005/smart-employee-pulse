import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, ChevronRight, Activity } from 'lucide-react';

interface DecisionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    trace: any;
    loading: boolean;
}

export const DecisionDrawer: React.FC<DecisionDrawerProps> = ({ isOpen, onClose, trace, loading }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/95 sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-amber-500" />
                                    Decision Trace
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">AI Reasoning Context</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 flex-1">
                            {loading ? (
                                <div className="space-y-4">
                                    <div className="h-24 bg-gray-800/50 animate-pulse rounded-lg" />
                                    <div className="h-48 bg-gray-800/50 animate-pulse rounded-lg" />
                                </div>
                            ) : trace ? (
                                <div className="space-y-6">
                                    {/* Constraints */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Constraints Applied</h3>
                                        <ul className="space-y-2">
                                            {trace.constraintsApplied?.map((c: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-400 bg-gray-800/30 p-2.5 rounded-lg border border-gray-800/50">
                                                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                    <span>{c}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Candidates */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Candidate Ranking</h3>
                                        <div className="space-y-3">
                                            {trace.candidateRanking?.map((c: any, i: number) => (
                                                <div key={i} className={`p-3 rounded-lg border ${i === 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-gray-800/30 border-gray-800/50'}`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`font-medium ${i === 0 ? 'text-amber-400' : 'text-gray-200'}`}>
                                                            {i + 1}. {c.name}
                                                        </span>
                                                        <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">Score: {c.score}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 pl-4 border-l-2 border-gray-700 mt-2">{c.reason}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rejections */}
                                    {trace.rejectionReasons?.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Rejections</h3>
                                            <ul className="space-y-2">
                                                {trace.rejectionReasons.map((r: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400 bg-red-500/5 p-2.5 rounded-lg border border-red-500/10">
                                                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                                        <span>{r}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Final output logic trace (simulated code block) */}
                                    <div className="mt-8">
                                        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Execution Log</h3>
                                        <div className="bg-[#0d1117] rounded-lg p-4 font-mono text-xs overflow-x-auto text-gray-300 border border-gray-800">
                                            <div className="flex gap-2 text-blue-400"><ChevronRight className="w-3 h-3 mt-0.5"/> <span>Analyzing node Graph...</span></div>
                                            <div className="flex gap-2 text-emerald-400"><ChevronRight className="w-3 h-3 mt-0.5"/> <span>Dependencies matched.</span></div>
                                            <div className="flex gap-2 text-purple-400"><ChevronRight className="w-3 h-3 mt-0.5"/> <span>Score calculated: {trace.finalScore}</span></div>
                                            <div className="flex gap-2 text-amber-400"><ChevronRight className="w-3 h-3 mt-0.5"/> <span>Assignment locked.</span></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 mt-10">No trace data available.</div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
