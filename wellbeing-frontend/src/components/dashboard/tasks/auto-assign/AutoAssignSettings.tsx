import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../ui/Card';
import { BulkAssignMode, RiskTolerance } from '../../../../types/tasks';
import { Zap, Shield, AlertTriangle } from 'lucide-react';

interface AutoAssignSettingsProps {
    mode: BulkAssignMode;
    setMode: (mode: BulkAssignMode) => void;
    riskTolerance: RiskTolerance;
    setRiskTolerance: (tolerance: RiskTolerance) => void;
}

const modeOptions: { value: BulkAssignMode; label: string; description: string; icon: React.ReactNode }[] = [
    {
        value: 'conservative',
        label: 'Conservative',
        description: 'Prioritize workload safety and skill match',
        icon: <Shield className="w-5 h-5" />,
    },
    {
        value: 'balanced',
        label: 'Balanced',
        description: 'Equal weight to all factors',
        icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
        value: 'aggressive',
        label: 'Aggressive',
        description: 'Maximize task completion over warnings',
        icon: <Zap className="w-5 h-5" />,
    },
];

const riskToleranceOptions: { value: RiskTolerance; label: string; description: string }[] = [
    {
        value: 'conservative',
        label: 'Conservative',
        description: 'Avoid high-risk assignments',
    },
    {
        value: 'moderate',
        label: 'Moderate',
        description: 'Some risk acceptable for task completion',
    },
    {
        value: 'aggressive',
        label: 'Aggressive',
        description: 'Accept high-risk assignments to clear queues',
    },
];

export default function AutoAssignSettings({
    mode,
    setMode,
    riskTolerance,
    setRiskTolerance,
}: AutoAssignSettingsProps) {
    return (
        <div className="space-y-6">
            {/* Assignment Mode */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-lg font-semibold text-foreground mb-3">Assignment Mode</h2>
                <div className="space-y-2">
                    {modeOptions.map((option) => (
                        <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setMode(option.value)}
                            className={`w-full p-3 rounded-lg text-left transition-colors ${mode === option.value
                                    ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-lg'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1">{option.icon}</div>
                                <div>
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-sm opacity-75">{option.description}</div>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Risk Tolerance */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-lg font-semibold text-foreground mb-3">Risk Tolerance</h2>
                <div className="space-y-2">
                    {riskToleranceOptions.map((option) => (
                        <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRiskTolerance(option.value)}
                            className={`w-full p-3 rounded-lg text-left transition-colors ${riskTolerance === option.value
                                    ? 'bg-purple-600 dark:bg-purple-600 text-white shadow-lg'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                }`}
                        >
                            <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm opacity-75">{option.description}</div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Info Card */}
            <Card className="p-4 bg-gradient-to-br from-neutral-50 to-neutral-50/50 dark:from-neutral-800/50 dark:to-neutral-800/30 border-neutral-200 dark:border-neutral-700">
                <h3 className="font-medium text-foreground text-sm mb-2">💡 Assignment Strategy</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {mode === 'conservative'
                        ? 'Only assigns to employees with sufficient capacity and relevant skills. Skips high-risk assignments.'
                        : mode === 'balanced'
                            ? 'Balances workload, skills, and deadline risk. Assigns to best-fit employees with reasonable confidence.'
                            : 'Maximizes assignment velocity. May assign to employees with higher workload if confidence is adequate.'}
                </p>
            </Card>
        </div>
    );
}