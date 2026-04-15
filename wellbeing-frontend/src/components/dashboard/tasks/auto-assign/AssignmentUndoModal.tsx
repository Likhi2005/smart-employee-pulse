import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Modal } from '../../../ui/Modal';
import { AutoAssignOperation } from '../../../../hooks/useAutoAssign';

interface AssignmentUndoModalProps {
    operation: AutoAssignOperation;
    isProcessing: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function AssignmentUndoModal({
    operation,
    isProcessing,
    onConfirm,
    onCancel,
}: AssignmentUndoModalProps) {
    return (
        <Modal isOpen onClose={onCancel}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-md shadow-xl"
            >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                </div>

                {/* Content */}
                <h2 className="text-lg font-semibold text-foreground text-center mb-2">Undo Auto-Assignment?</h2>
                <p className="text-muted-foreground text-center text-sm mb-4">
                    This will revert all {operation.successCount} successful assignments back to pending status.
                    This action cannot be undone.
                </p>

                {/* Details */}
                <div className="bg-orange-50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-900/40 rounded-lg p-3 mb-6 text-sm">
                    <div className="space-y-2 text-muted-foreground">
                        <p>
                            <span className="font-medium">Tasks to revert:</span> {operation.successCount}
                        </p>
                        <p>
                            <span className="font-medium">Executed at:</span>{' '}
                            {operation.executedAt.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="flex-1"
                    >
                        Keep Assignments
                    </Button>

                    <motion.button
                        whileHover={!isProcessing ? { scale: 1.02 } : {}}
                        whileTap={!isProcessing ? { scale: 0.98 } : {}}
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${isProcessing
                                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'
                                : 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white'
                            }`}
                    >
                        <RotateCcw className="w-4 h-4" />
                        {isProcessing ? 'Reverting...' : 'Yes, Undo'}
                    </motion.button>
                </div>
            </motion.div>
        </Modal>
    );
}