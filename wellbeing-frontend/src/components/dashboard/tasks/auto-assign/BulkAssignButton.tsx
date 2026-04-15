import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../ui/Button';
import { Zap, Loader } from 'lucide-react';

interface BulkAssignButtonProps {
    selectedCount: number;
    totalCount: number;
    isProcessing: boolean;
    onExecute: () => void;
}

export default function BulkAssignButton({
    selectedCount,
    totalCount,
    isProcessing,
    onExecute,
}: BulkAssignButtonProps) {
    const isDisabled = selectedCount === 0 || isProcessing;

    return (
        <motion.button
            whileHover={!isDisabled ? { scale: 1.02 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
            onClick={onExecute}
            disabled={isDisabled}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${isDisabled
                    ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-lg'
                }`}
        >
            {isProcessing ? (
                <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                        <Loader className="w-4 h-4" />
                    </motion.div>
                    <span>Processing...</span>
                </>
            ) : (
                <>
                    <Zap className="w-4 h-4" />
                    <span>
                        Execute Auto-Assign{selectedCount > 0 ? ` (${selectedCount})` : ''}
                    </span>
                </>
            )}
        </motion.button>
    );
}