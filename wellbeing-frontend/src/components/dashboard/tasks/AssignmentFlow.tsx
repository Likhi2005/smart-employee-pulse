import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Task, AIsuggestion } from '@/types/index';
import { AISuggestionCard } from './AIsuggestionCard';
import { AlternativeSuggestions } from './AlternativeSuggestions';
import { employeesData } from '@/data/managerStatsData';

interface AssignmentFlowProps {
    isOpen: boolean;
    task: Task | null;
    suggestions: AIsuggestion[];
    isLoading?: boolean;
    onClose: () => void;
    onConfirm: (employeeId: string) => void;
}

export function AssignmentFlow({
    isOpen,
    task,
    suggestions,
    isLoading = false,
    onClose,
    onConfirm,
}: AssignmentFlowProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(
        suggestions.length > 0 ? suggestions[0].employee.id : null
    );
    const [manualMode, setManualMode] = useState(false);

    const handleConfirm = () => {
        if (selectedEmployee) {
            onConfirm(selectedEmployee);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && task && (
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
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-700 bg-gradient-to-br from-neutral-900 to-black p-6 shadow-2xl overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between sticky top-0 bg-black/50 -mx-6 px-6 pb-4 border-b border-neutral-700">
                            <div>
                                <span className="text-xs font-medium text-neutral-400">ASSIGN TASK</span>
                                <h2 className="mt-1 text-xl font-semibold text-neutral-50 truncate">{task.title}</h2>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={onClose}
                                className="p-1 text-neutral-400 hover:text-neutral-200 flex-shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </motion.button>
                        </div>

                        {/* Step Indicator */}
                        <div className="mb-6 flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-neutral-400'
                                }`}>
                                1
                            </div>
                            <div className={`h-1 flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-neutral-700'}`} />
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-neutral-400'
                                }`}>
                                2
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            {/* Step 1: Show Options */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                                            Task Details
                                        </h3>
                                        <div className="space-y-2 rounded-lg bg-neutral-900/50 border border-neutral-800 p-4">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-400">Effort:</span>
                                                <span className="font-semibold text-neutral-50">{task.effort} hours</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-400">Priority:</span>
                                                <span className="font-semibold text-neutral-50 capitalize">{task.priority}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-400">Due Date:</span>
                                                <span className="font-semibold text-neutral-50">{task.dueDate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mode Selection */}
                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                                            Assignment Method
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => setManualMode(false)}
                                                className={`rounded-lg border p-4 transition-all text-left ${!manualMode
                                                        ? 'border-blue-600/50 bg-blue-600/10'
                                                        : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-600'
                                                    }`}
                                            >
                                                <div className="font-semibold text-neutral-50">✨ AI Smart</div>
                                                <p className="mt-1 text-xs text-neutral-400">
                                                    Get AI-powered recommendation based on workload
                                                </p>
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => setManualMode(true)}
                                                className={`rounded-lg border p-4 transition-all text-left ${manualMode
                                                        ? 'border-blue-600/50 bg-blue-600/10'
                                                        : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-600'
                                                    }`}
                                            >
                                                <div className="font-semibold text-neutral-50">👤 Manual</div>
                                                <p className="mt-1 text-xs text-neutral-400">
                                                    Choose employee manually from list
                                                </p>
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Next Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setStep(2)}
                                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600/20 py-3 text-sm font-semibold text-blue-400 border border-blue-600/50 hover:bg-blue-600/30"
                                    >
                                        Next: Choose Employee
                                        <ArrowRight className="h-4 w-4" />
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* Step 2: Choose Employee */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {!manualMode && suggestions.length > 0 ? (
                                        <>
                                            {/* AI Suggestion Card */}
                                            <AISuggestionCard
                                                suggestion={suggestions[0]}
                                                onAccept={(empId) => setSelectedEmployee(empId)}
                                                isLoading={isLoading}
                                            />

                                            {/* Alternatives */}
                                            {suggestions.length > 1 && (
                                                <AlternativeSuggestions
                                                    suggestions={suggestions}
                                                    onSelect={(sugg) => setSelectedEmployee(sugg.employee.id)}
                                                    selectedId={selectedEmployee}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        /* Manual Selection */
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-neutral-50 mb-4">
                                                Select Employee
                                            </h3>
                                            {employeesData.map((emp) => (
                                                <motion.button
                                                    key={emp.id}
                                                    whileHover={{ scale: 1.01 }}
                                                    onClick={() => setSelectedEmployee(emp.id)}
                                                    className={`w-full rounded-lg border p-4 transition-all text-left ${selectedEmployee === emp.id
                                                            ? 'border-blue-600/50 bg-blue-600/10'
                                                            : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-600'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={emp.avatar}
                                                            alt={emp.name}
                                                            className="h-10 w-10 rounded-full"
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-neutral-50">{emp.name}</p>
                                                            <p className="text-xs text-neutral-400">
                                                                {emp.taskCount} tasks • {emp.workloadLevel} workload
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-neutral-700">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => setStep(1)}
                                            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-neutral-700 py-3 text-sm font-medium text-neutral-50 hover:bg-neutral-800/50"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Back
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            onClick={handleConfirm}
                                            disabled={!selectedEmployee || isLoading}
                                            className="flex-1 rounded-lg bg-green-600/20 py-3 text-sm font-semibold text-green-400 border border-green-600/50 hover:bg-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isLoading ? 'Assigning...' : 'Confirm & Assign'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}