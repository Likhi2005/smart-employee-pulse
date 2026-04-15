'use client';

import { Task, WorkloadSnapshot } from '@/types/tasks';
import { workloadEngine } from '@/services/workloadEngine';

interface ManualEmployeeListProps {
    selectedEmployee: string | null;
    onSelectEmployee: (employeeId: string) => void;
    employeeSnapshots: Map<string, WorkloadSnapshot>;
    task: Task;
}

export default function ManualEmployeeList({
    selectedEmployee,
    onSelectEmployee,
    employeeSnapshots,
    task
}: ManualEmployeeListProps) {
    const employees = Array.from(employeeSnapshots.values());

    return (
        <div className="space-y-3">
            {employees.map(employee => {
                const isSelected = selectedEmployee === employee.employeeId;
                const projected = workloadEngine.calculateProjectedWorkload(employee, task);
                const overloadCheck = workloadEngine.checkOverloadWarning(employee, task.effort);

                return (
                    <div
                        key={employee.employeeId}
                        onClick={() => onSelectEmployee(employee.employeeId)}
                        className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all
              ${isSelected
                                ? 'border-blue-600 bg-blue-600/5'
                                : 'border-neutral-700 hover:border-neutral-600'
                            }
            `}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground">{employee.employeeName}</h3>
                                <div className="grid grid-cols-3 gap-4 mt-2 text-xs text-muted-foreground">
                                    <div>
                                        <p>Current: {employee.workloadScore}%</p>
                                    </div>
                                    <div>
                                        <p>Projected: {projected.workloadScore}%</p>
                                    </div>
                                    <div>
                                        <p>Available: {projected.availableCapacity.toFixed(1)}h</p>
                                    </div>
                                </div>
                            </div>

                            {overloadCheck.wouldOverload && (
                                <div className="ml-4 px-3 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded">
                                    ⚠ Overload Risk
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}