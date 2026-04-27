import React from 'react';
import { ActionCard } from './ActionCard';
import { Activity } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface PriorityActionsPanelProps {
    conflicts: any[];
    loading: boolean;
    onApply: (conflict: any) => void;
    onWhy: (conflict: any) => void;
    isApplying: string | null;
}

export const PriorityActionsPanel: React.FC<PriorityActionsPanelProps> = ({ conflicts, loading, onApply, onWhy, isApplying }) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-gray-100">Priority Actions</h2>
                <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-medium ml-2">
                    {conflicts.length} Pending
                </span>
            </div>

            {loading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-48 bg-gray-800/40 animate-pulse rounded-xl border border-gray-700/50" />
                    ))}
                </div>
            ) : conflicts.length === 0 ? (
                <div className="p-8 text-center bg-gray-800/30 border border-gray-700/50 rounded-xl">
                    <p className="text-gray-400">All systems optimal. No immediate actions required.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {conflicts.slice(0, 3).map(conflict => (
                            <ActionCard
                                key={conflict.id}
                                conflict={conflict}
                                onApply={onApply}
                                onWhy={onWhy}
                                isApplying={isApplying === conflict.id}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
