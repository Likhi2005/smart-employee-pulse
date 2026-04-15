'use client';

import { Task, WorkloadSnapshot, AIAssignmentSuggestion } from '@/types/tasks';
import AISmartSuggestions from './AISmartSuggestions';
import ManualEmployeeList from './ManualEmployeeList';
import { Button } from '@/components/ui/Button';
import { Zap, Users } from 'lucide-react';

interface EmployeeSelectionPanelProps {
    task: Task;
    assignmentMode: 'manual' | 'ai';
    onModeChange: (mode: 'manual' | 'ai') => void;
    suggestions: AIAssignmentSuggestion[];
    selectedEmployee: string | null;
    onSelectEmployee: (employeeId: string) => void;
    employeeSnapshots: Map<string, WorkloadSnapshot>;
    isLoading: boolean;
}

export default function EmployeeSelectionPanel({
    task,
    assignmentMode,
    onModeChange,
    suggestions,
    selectedEmployee,
    onSelectEmployee,
    employeeSnapshots,
    isLoading
}: EmployeeSelectionPanelProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Mode Selector */}
            <div className="flex gap-3 p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
                <Button
                    variant={assignmentMode === 'ai' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onModeChange('ai')}
                    className="gap-2"
                >
                    <Zap className="w-4 h-4" />
                    AI Smart Suggestions
                </Button>
                <Button
                    variant={assignmentMode === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onModeChange('manual')}
                    className="gap-2"
                >
                    <Users className="w-4 h-4" />
                    Manual Selection
                </Button>
            </div>

            {/* Content based on mode */}
            {assignmentMode === 'ai' ? (
                <AISmartSuggestions
                    task={task}
                    suggestions={suggestions}
                    selectedEmployee={selectedEmployee}
                    onSelectEmployee={onSelectEmployee}
                    isLoading={isLoading}
                    employeeSnapshots={employeeSnapshots}
                />
            ) : (
                <ManualEmployeeList
                    selectedEmployee={selectedEmployee}
                    onSelectEmployee={onSelectEmployee}
                    employeeSnapshots={employeeSnapshots}
                    task={task}
                />
            )}
        </div>
    );
}