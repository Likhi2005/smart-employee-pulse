'use client';

import { Task, WorkloadSnapshot, AIAssignmentSuggestion } from '@/types/tasks';
import ConfidenceScore from './ConfidenceScore';
import OverloadWarning from './OverloadWarning';
import WorkloadSimulationChart from './WorkloadSimulationChart';
import DeadlineRiskIndicator from './DeadlineRiskIndicator';
import AcceptanceProbability from './AcceptanceProbability';
import SkillMatcher from './SkillMatcher';
import { Badge } from '@/components/ui/Badge';
import { Crown, AlertTriangle } from 'lucide-react';

interface AISmartSuggestionsProps {
    task: Task;
    suggestions: AIAssignmentSuggestion[];
    selectedEmployee: string | null;
    onSelectEmployee: (employeeId: string) => void;
    isLoading: boolean;
    employeeSnapshots: Map<string, WorkloadSnapshot>;
}

export default function AISmartSuggestions({
    task,
    suggestions,
    selectedEmployee,
    onSelectEmployee,
    isLoading,
    employeeSnapshots
}: AISmartSuggestionsProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-muted-foreground">
                    Analyzing team workload, skills, and capacity...
                </div>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                No suggestions available. Please try with different task parameters.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {suggestions.map((suggestion, idx) => {
                const isSelected = selectedEmployee === suggestion.employeeId;
                const currentSnapshot = employeeSnapshots.get(suggestion.employeeId);
                const projectedWorkload = suggestion.analysis.projectedWorkload;

                return (
                    <div
                        key={suggestion.employeeId}
                        onClick={() => onSelectEmployee(suggestion.employeeId)}
                        className={`
              p-6 rounded-lg border-2 cursor-pointer transition-all
              ${isSelected
                                ? 'border-blue-600 bg-blue-600/5 shadow-lg'
                                : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-900/70'
                            }
            `}
                    >
                        {/* Header with Rank and Name */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {suggestion.rank === 1 && (
                                    <Crown className="w-5 h-5 text-amber-400" />
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold text-foreground">
                                            #{suggestion.rank} - {suggestion.employeeName}
                                        </span>
                                        {suggestion.analysis.warnings && suggestion.analysis.warnings.length > 0 && (
                                            <Badge variant="destructive" className="text-xs">
                                                {suggestion.analysis.warnings.length} warning
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {suggestion.analysis.reasoning}
                                    </p>
                                </div>
                            </div>

                            {/* Confidence Score */}
                            <ConfidenceScore confidence={suggestion.confidence} />
                        </div>

                        {/* Why This Employee Card */}
                        <div className="p-4 bg-neutral-800/50 rounded border border-neutral-700 mb-4">
                            <h4 className="text-sm font-semibold text-foreground mb-2">Why This Employee?</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Available capacity: {projectedWorkload.availableCapacity.toFixed(1)}h</li>
                                <li>• Current workload: {suggestion.analysis.currentWorkload.workloadScore}%</li>
                                <li>• Projected: {projectedWorkload.workloadScore}%</li>
                                <li>• Risk level: <span className="capitalize text-foreground">{projectedWorkload.riskLevel}</span></li>
                            </ul>
                        </div>

                        {/* Grid: 4 Smart Features */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            <SkillMatcher skillMatch={suggestion.analysis.skillMatch} />
                            <DeadlineRiskIndicator risk={suggestion.analysis.deadline_proximity_risk} />
                            <AcceptanceProbability probability={suggestion.analysis.acceptance_probability} />
                            <OverloadWarning
                                willOverload={projectedWorkload.workloadScore >= 100}
                                severity={
                                    projectedWorkload.workloadScore >= 100 ? 'critical' :
                                        projectedWorkload.workloadScore >= 80 ? 'warning' : 'info'
                                }
                            />
                        </div>

                        {/* Workload Visualization */}
                        {currentSnapshot && (
                            <WorkloadSimulationChart
                                current={suggestion.analysis.currentWorkload}
                                projected={suggestion.analysis.projectedWorkload}
                                taskEffort={task.effort}
                            />
                        )}

                        {/* Warnings */}
                        {suggestion.analysis.warnings && suggestion.analysis.warnings.length > 0 && (
                            <div className="mt-4 p-3 bg-yellow-600/10 border border-yellow-600/20 rounded">
                                <p className="text-xs font-medium text-yellow-600 mb-1">Warnings:</p>
                                <ul className="text-xs text-yellow-600/80 space-y-0.5">
                                    {suggestion.analysis.warnings.map((warning, idx) => (
                                        <li key={idx}>{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}