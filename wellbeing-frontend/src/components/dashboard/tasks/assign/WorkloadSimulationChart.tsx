'use client';

import { WorkloadSnapshot } from '@/types/tasks';

interface WorkloadSimulationChartProps {
    current: WorkloadSnapshot;
    projected: WorkloadSnapshot;
    taskEffort: number;
}

export default function WorkloadSimulationChart({
    current,
    projected,
    taskEffort
}: WorkloadSimulationChartProps) {
    return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-foreground">Workload Simulation</p>

            {/* Current */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Current</span>
                    <span className="text-xs font-semibold text-foreground">{current.workloadScore}%</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${current.workloadScore}%` }}
                    />
                </div>
            </div>

            {/* + Task */}
            <div className="text-xs text-muted-foreground text-center py-1">
                + {taskEffort}h task
            </div>

            {/* Projected */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Projected</span>
                    <span className="text-xs font-semibold text-foreground">{projected.workloadScore}%</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${projected.workloadScore >= 100 ? 'bg-red-600' :
                                projected.workloadScore >= 80 ? 'bg-yellow-600' :
                                    'bg-emerald-600'
                            }`}
                        style={{ width: `${projected.workloadScore}%` }}
                    />
                </div>
            </div>
        </div>
    );
}