import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface ActionCardProps {
    conflict: any;
    onApply: (id: string) => void;
    onWhy: (id: string) => void;
    isApplying: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({ conflict, onApply, onWhy, isApplying }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-xl flex flex-col gap-3 relative overflow-hidden group hover:border-amber-500/30 transition-colors"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <h3 className="text-gray-100 font-semibold">{conflict.title}</h3>
                </div>
                <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                    {conflict.type}
                </span>
            </div>

            <p className="text-sm text-gray-400">
                {conflict.description}
            </p>

            <div className="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 text-sm text-emerald-400 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Suggested Action:</span>
                </div>
                <p className="text-sm text-gray-300 ml-6">{conflict.suggestedAction}</p>
                <p className="text-xs text-gray-500 ml-6 mt-1">Impact: {conflict.impact}</p>
            </div>

            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => onApply(conflict.id)}
                    disabled={isApplying}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {isApplying ? 'Applying...' : 'Apply Fix'}
                </button>
                <button
                    onClick={() => onWhy(conflict.id)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <HelpCircle className="w-4 h-4" />
                    Why?
                </button>
            </div>
        </motion.div>
    );
};
