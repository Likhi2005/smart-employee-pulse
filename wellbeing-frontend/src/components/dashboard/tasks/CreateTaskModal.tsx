import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Task } from '@/types/index';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'assignedTo'>) => void;
    isLoading?: boolean;
}

export function CreateTaskModal({ isOpen, onClose, onSubmit, isLoading = false }: CreateTaskModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        effort: 1,
        priority: 'medium' as const,
        dueDate: '',
        isMandatory: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        onSubmit({
            ...formData,
            status: 'pending',
            assignedBy: 'Manager',
        });

        setFormData({
            title: '',
            description: '',
            effort: 1,
            priority: 'medium',
            dueDate: '',
            isMandatory: false,
        });

        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-700 bg-gradient-to-br from-neutral-900 to-black p-6 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-neutral-50">Create New Task</h2>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={onClose}
                                className="p-1 text-neutral-400 hover:text-neutral-200"
                            >
                                <X className="h-5 w-5" />
                            </motion.button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-50 mb-1.5">
                                    Task Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Fix login bug"
                                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-neutral-50 placeholder-neutral-500 focus:border-blue-600 focus:outline-none"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-50 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe what needs to be done..."
                                    rows={3}
                                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-neutral-50 placeholder-neutral-500 focus:border-blue-600 focus:outline-none resize-none"
                                />
                            </div>

                            {/* Row: Effort + Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-50 mb-1.5">
                                        Effort (hours) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="40"
                                        value={formData.effort}
                                        onChange={(e) => setFormData({ ...formData, effort: parseInt(e.target.value) })}
                                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-neutral-50 focus:border-blue-600 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-50 mb-1.5">
                                        Priority
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) =>
                                            setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })
                                        }
                                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-neutral-50 focus:border-blue-600 focus:outline-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-50 mb-1.5">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-neutral-50 focus:border-blue-600 focus:outline-none"
                                />
                            </div>

                            {/* Mandatory Toggle */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="mandatory"
                                    checked={formData.isMandatory}
                                    onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-800/50 text-blue-600 cursor-pointer"
                                />
                                <label htmlFor="mandatory" className="text-sm text-neutral-50 cursor-pointer">
                                    Mark as mandatory (employees cannot reject)
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="mt-6 flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 rounded-lg border border-neutral-700 py-2.5 text-sm font-medium text-neutral-50 hover:bg-neutral-800/50 transition-colors"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    type="submit"
                                    disabled={isLoading || !formData.title.trim()}
                                    className="flex-1 rounded-lg bg-blue-600/20 py-2.5 text-sm font-medium text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? 'Creating...' : 'Create Task'}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}