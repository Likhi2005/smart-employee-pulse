'use client';

import { useState, useMemo } from 'react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useWorkloadCalculation } from '@/hooks/useWorkloadCalculation';
import TaskCreationForm from './TaskCreationForm';
import EmployeeSelectionPanel from './EmployeeSelectionPanel';
import AssignmentPreview from './AssignmentPreview';
import { Task, WorkloadSnapshot, AIAssignmentSuggestion } from '@/types/tasks';
import assignmentService from '@/services/assignmentService';
import { AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

type AssignmentMode = 'create' | 'review' | 'confirm';

export default function AssignNewView() {
  const { createTask, assignTask } = useTaskManagement();
  const { employeeSnapshots, isCalculating } = useWorkloadCalculation();

  const [mode, setMode] = useState<AssignmentMode>('create');
  const [newTask, setNewTask] = useState<Partial<Task> | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<'manual' | 'ai'>('ai');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AIAssignmentSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleTaskCreate = async (taskData: Partial<Task>) => {
    try {
      setError(null);
      setNewTask(taskData);

      if (assignmentMode === 'ai') {
        setIsLoadingSuggestions(true);
        try {
          const taskToSuggest: Task = {
            id: 'temp',
            createdAt: new Date().toISOString(),
            assignedBy: 'current-user',
            status: 'pending',
            ...(taskData as Task)
          };

          const generatedSuggestions = await assignmentService.generateSuggestions(
            taskToSuggest,
            employeeSnapshots
          );
          setSuggestions(generatedSuggestions);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }

      setMode('review');
    } catch (err: any) {
      setError(err.message || 'Failed to process task');
    }
  };

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployee(employeeId);
  };

  const handleProceedToConfirm = () => {
    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }
    setMode('confirm');
  };

  const handleConfirmAssignment = async () => {
    if (!newTask || !selectedEmployee) return;

    setIsAssigning(true);
    setError(null);

    try {
      const createdTask = await createTask(newTask);
      const aiSuggested = suggestions.length > 0 && assignmentMode === 'ai';
      await assignTask(createdTask.id, selectedEmployee, {
        aiSuggested
      });

      setMode('create');
      setNewTask(null);
      setSelectedEmployee(null);
      setSuggestions([]);
    } catch (err: any) {
      setError(err.message || 'Failed to assign task');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleBack = () => {
    if (mode === 'review') {
      setMode('create');
      setNewTask(null);
      setSuggestions([]);
      setSelectedEmployee(null);
    } else if (mode === 'confirm') {
      setMode('review');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Assign New Task</h1>
          <p className="text-neutral-300">Create and intelligently assign a new task to your team</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 mb-8"
        >
          {[
            { num: 1, label: 'Create Task', key: 'create' },
            { num: 2, label: 'Select Employee', key: 'review' },
            { num: 3, label: 'Confirm', key: 'confirm' }
          ].map((step, idx) => (
            <div key={step.key} className="flex items-center gap-4">
              <motion.div
                animate={{
                  backgroundColor: mode === step.key ? '#2563eb' : step.key === 'create' ? '#3b82f6' : '#404040',
                  scale: mode === step.key ? 1.1 : 1
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
              >
                {step.num}
              </motion.div>
              <span className={mode === step.key ? 'text-blue-400 font-medium' : 'text-neutral-400 text-sm'}>
                {step.label}
              </span>
              {idx < 2 && (
                <ArrowRight className="w-4 h-4 text-neutral-500 ml-2" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-950 border border-red-800 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-200">Error</h3>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Content Area */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-neutral-800 rounded-lg border border-neutral-700 p-8"
        >
          {mode === 'create' && (
            <TaskCreationForm
              onSubmit={handleTaskCreate}
              isLoading={isLoadingSuggestions}
              onModeChange={setAssignmentMode}
            />
          )}

          {mode === 'review' && newTask && (
            <EmployeeSelectionPanel
              task={newTask}
              employeeSnapshots={employeeSnapshots}
              suggestions={suggestions}
              selectedEmployee={selectedEmployee}
              onSelectEmployee={handleSelectEmployee}
              assignmentMode={assignmentMode}
              isLoading={isLoadingSuggestions}
            />
          )}

          {mode === 'confirm' && newTask && selectedEmployee && (
            <AssignmentPreview
              task={newTask}
              selectedEmployeeId={selectedEmployee}
              employeeSnapshots={employeeSnapshots}
              suggestions={suggestions}
              isAssigning={isAssigning}
              onConfirm={handleConfirmAssignment}
            />
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between mt-6"
        >
          <Button
            onClick={handleBack}
            disabled={mode === 'create' || isAssigning}
            variant="outline"
            className="text-neutral-300 border-neutral-600 hover:bg-neutral-700"
          >
            Back
          </Button>

          {mode === 'create' && (
            <Button
              onClick={() => handleTaskCreate(newTask || {})}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue
            </Button>
          )}

          {mode === 'review' && (
            <Button
              onClick={handleProceedToConfirm}
              disabled={!selectedEmployee}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Review Assignment
            </Button>
          )}

          {mode === 'confirm' && (
            <Button
              onClick={handleConfirmAssignment}
              disabled={isAssigning}
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
            >
              {isAssigning ? 'Assigning...' : <><CheckCircle className="w-4 h-4" /> Confirm Assignment</>}
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}