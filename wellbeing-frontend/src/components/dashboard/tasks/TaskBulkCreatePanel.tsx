import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles, Loader2, List, Plus, Trash2, CheckCircle2,
    AlertTriangle, AlertCircle, ChevronRight, LayoutGrid, RefreshCw, Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { breakdownProject, aiDistributeTasks } from '@/services/aiService'
import { BulkAssignmentReviewModal } from './BulkAssignmentReviewModal'

interface GeneratedTask {
    title: string
    description: string
    effort: number
    priority: 'low' | 'medium' | 'high'
}

interface AIDistributeMapping {
    taskIndex: number
    taskTitle: string
    effort: number
    priority: string
    employeeId: string
    employeeName: string
    employeeEmail: string
    projectedWorkload: number
    reason: string
    policyStatus: string
    policyWarnings: string[]
}

interface TaskBulkCreatePanelProps {
    onTasksCreated: () => void
    onBulkCreate: (tasks: GeneratedTask[]) => Promise<void>
    isSubmitting: boolean
}

const PRIORITY_COLORS = {
    high: 'bg-red-500/15 text-red-300 border-red-500/30',
    medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
}

export function TaskBulkCreatePanel({
    onTasksCreated,
    onBulkCreate,
    isSubmitting
}: TaskBulkCreatePanelProps) {
    const [prompt, setPrompt] = useState('')
    const [totalEffort, setTotalEffort] = useState('20')
    const [isBreakingDown, setIsBreakingDown] = useState(false)
    const [isDistributing, setIsDistributing] = useState(false)
    const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([])
    const [breakdownStrategy, setBreakdownStrategy] = useState('')
    const [error, setError] = useState('')

    // Distribution modal state
    const [isBulkReviewOpen, setIsBulkReviewOpen] = useState(false)
    const [distributionMapping, setDistributionMapping] = useState<AIDistributeMapping[]>([])
    const [isBulkAssigning, setIsBulkAssigning] = useState(false)

    const handleBreakdown = async () => {
        if (!prompt.trim()) return
        setIsBreakingDown(true)
        setError('')
        setGeneratedTasks([])
        setBreakdownStrategy('')
        try {
            const { subtasks, breakdownStrategy: strategy } = await breakdownProject({
                title: prompt,
                effort: Number(totalEffort)
            })
            if (!subtasks || subtasks.length === 0) {
                setError('AI returned no sub-tasks. Please try again with a more detailed description.')
                return
            }
            setGeneratedTasks(subtasks)
            setBreakdownStrategy(strategy)
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'AI breakdown failed. Please try again.'
            setError(msg)
        } finally {
            setIsBreakingDown(false)
        }
    }

    const removeTask = (index: number) => {
        setGeneratedTasks(prev => prev.filter((_, i) => i !== index))
    }

    const addTask = () => {
        setGeneratedTasks(prev => [...prev, {
            title: 'New Task',
            description: '',
            effort: 4,
            priority: 'medium'
        }])
    }

    const updateTask = (index: number, patch: Partial<GeneratedTask>) => {
        setGeneratedTasks(prev => prev.map((t, i) => i === index ? { ...t, ...patch } : t))
    }

    const handleAIDistribute = async () => {
        if (!generatedTasks.length) return
        setIsDistributing(true)
        setError('')
        try {
            const mapping = await aiDistributeTasks(
                generatedTasks.map(t => ({ title: t.title, effort: t.effort, priority: t.priority }))
            )
            if (!mapping || mapping.length === 0) {
                setError('AI distribution returned no assignments. Try again.')
                return
            }
            setDistributionMapping(mapping)
            setIsBulkReviewOpen(true)
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'AI distribution failed.'
            // Handle policy blockers
            if (err?.response?.status === 422 && err?.response?.data?.blockedTasks) {
                const blocked = err.response.data.blockedTasks
                setError(`Policy blocked ${blocked.length} task(s): ${blocked.map((b: any) => `"${b.taskTitle}": ${b.blockers.join(', ')}`).join(' | ')}`)
            } else {
                setError(msg)
            }
        } finally {
            setIsDistributing(false)
        }
    }

    const handleConfirmDistribute = async (finalAssignments: Array<{ taskId: string; employeeId: string }>) => {
        // Since these tasks aren't created yet, we create + assign in sequence
        // In the modal, taskId is actually the taskIndex string; we remap here
        setIsBulkAssigning(true)
        setError('')
        try {
            // First create all tasks to get their IDs
            await onBulkCreate(generatedTasks)
            setIsBulkReviewOpen(false)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to create and assign tasks.')
        } finally {
            setIsBulkAssigning(false)
        }
    }

    // Convert distribution mapping to the format expected by BulkAssignmentReviewModal
    const modalMapping = distributionMapping.map((m, idx) => ({
        taskId: String(idx),    // using index as placeholder ID for pre-creation
        taskTitle: m.taskTitle,
        employeeId: m.employeeId,
        employeeName: m.employeeName,
        effort: m.effort,
        projectedWorkload: m.projectedWorkload,
        reason: m.reason,
        policyStatus: m.policyStatus,
        policyWarnings: m.policyWarnings,
    }))

    // Mock employees from mapping for the modal
    const modalEmployees = Array.from(
        new Map(distributionMapping.map(m => [m.employeeId, {
            _id: m.employeeId,
            fullName: m.employeeName,
            email: m.employeeEmail,
            currentWorkload: m.projectedWorkload,
        }])).values()
    )

    return (
        <div className="space-y-5">
            {/* Phase 1: Prompt Input */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
                <div className="mb-1 flex items-center gap-2">
                    <Sparkles className="text-amber-500" size={18} />
                    <h3 className="text-lg font-semibold text-neutral-100">Smart Project Breakdown</h3>
                </div>
                <p className="mb-5 text-sm text-neutral-400">
                    Describe your project goal. Gemini AI will decompose it into prioritized sub-tasks, then intelligently distribute them across your team.
                </p>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <div className="lg:col-span-3">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                            Project / Feature Description
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Implement a new authentication flow with MFA, social logins (Google, GitHub), and session management..."
                            rows={4}
                            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 outline-none transition-colors focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 resize-none"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                Total Effort (hrs)
                            </label>
                            <input
                                type="number"
                                value={totalEffort}
                                min={2}
                                max={200}
                                onChange={(e) => setTotalEffort(e.target.value)}
                                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-amber-500/60"
                            />
                        </div>
                        <Button
                            onClick={handleBreakdown}
                            disabled={isBreakingDown || !prompt.trim()}
                            className="mt-auto w-full bg-amber-500 text-neutral-950 hover:bg-amber-400 disabled:opacity-50"
                        >
                            {isBreakingDown ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={15} className="animate-spin" />
                                    AI Thinking...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Sparkles size={15} />
                                    Generate Breakdown
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Error state */}
                {error && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2.5">
                        <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}
            </div>

            {/* Phase 2: Generated Tasks Review */}
            <AnimatePresence>
                {generatedTasks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
                                    <List size={16} className="text-amber-500" />
                                    AI Generated Sub-tasks
                                    <span className="ml-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400">
                                        {generatedTasks.length} tasks
                                    </span>
                                </h4>
                                {breakdownStrategy && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                                        <Info size={11} />
                                        {breakdownStrategy}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={handleBreakdown} disabled={isBreakingDown} className="text-neutral-400 hover:text-neutral-100">
                                    <RefreshCw size={13} className="mr-1" />
                                    Regenerate
                                </Button>
                                <Button variant="ghost" size="sm" onClick={addTask} className="text-amber-500">
                                    <Plus size={13} className="mr-1" /> Add Task
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {generatedTasks.map((task, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="group rounded-lg border border-neutral-800 bg-neutral-950/60 p-3.5 transition-all hover:border-neutral-700"
                                >
                                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-center">
                                        {/* Task number */}
                                        <div className="hidden items-center lg:flex lg:col-span-1">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-neutral-400">
                                                {idx + 1}
                                            </span>
                                        </div>

                                        {/* Title + Description */}
                                        <div className="lg:col-span-5">
                                            <input
                                                value={task.title}
                                                onChange={(e) => updateTask(idx, { title: e.target.value })}
                                                className="w-full bg-transparent text-sm font-medium text-neutral-100 outline-none placeholder:text-neutral-600 focus:text-amber-400"
                                                placeholder="Task title..."
                                            />
                                            <input
                                                value={task.description}
                                                onChange={(e) => updateTask(idx, { description: e.target.value })}
                                                placeholder="Description (optional)"
                                                className="mt-0.5 w-full bg-transparent text-xs text-neutral-500 outline-none focus:text-neutral-300"
                                            />
                                        </div>

                                        {/* Effort */}
                                        <div className="lg:col-span-2">
                                            <label className="mb-0.5 block text-[10px] uppercase tracking-wider text-neutral-600">Effort (hrs)</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={task.effort}
                                                onChange={(e) => updateTask(idx, { effort: Number(e.target.value) })}
                                                className="w-full rounded bg-neutral-900 px-2 py-1 text-sm text-neutral-200 outline-none border border-neutral-800 focus:border-amber-500/50"
                                            />
                                        </div>

                                        {/* Priority */}
                                        <div className="lg:col-span-3">
                                            <label className="mb-0.5 block text-[10px] uppercase tracking-wider text-neutral-600">Priority</label>
                                            <select
                                                value={task.priority}
                                                onChange={(e) => updateTask(idx, { priority: e.target.value as any })}
                                                className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-sm text-neutral-200 outline-none focus:border-amber-500/50"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>

                                        {/* Priority badge + delete */}
                                        <div className="flex items-center justify-between gap-2 lg:col-span-1">
                                            <span className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-semibold lg:inline-flex ${PRIORITY_COLORS[task.priority]}`}>
                                                {task.priority}
                                            </span>
                                            <button
                                                onClick={() => removeTask(idx)}
                                                className="ml-auto text-neutral-700 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Totals bar */}
                        <div className="mt-4 flex items-center gap-4 rounded-lg bg-neutral-950/40 px-4 py-2.5 text-xs text-neutral-400">
                            <span>Total effort: <span className="font-semibold text-neutral-200">{generatedTasks.reduce((s, t) => s + t.effort, 0)} hrs</span></span>
                            <span>Tasks: <span className="font-semibold text-neutral-200">{generatedTasks.length}</span></span>
                            <span>High priority: <span className="font-semibold text-red-300">{generatedTasks.filter(t => t.priority === 'high').length}</span></span>
                        </div>

                        {/* Phase 3 Actions */}
                        <div className="mt-5 flex flex-col gap-3 border-t border-neutral-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <Button variant="ghost" size="sm" onClick={() => setGeneratedTasks([])} className="text-neutral-500">
                                Clear All
                            </Button>
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Create only (no distribution) */}
                                <Button
                                    onClick={() => onBulkCreate(generatedTasks)}
                                    disabled={isSubmitting || isDistributing || generatedTasks.length === 0}
                                    className="border border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={14} className="mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={14} className="mr-2" />
                                    )}
                                    Create {generatedTasks.length} Tasks Only
                                </Button>

                                {/* AI Smart Distribute (creates + distributes) */}
                                <Button
                                    onClick={handleAIDistribute}
                                    disabled={isDistributing || isSubmitting || generatedTasks.length === 0}
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-neutral-950 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50"
                                >
                                    {isDistributing ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 size={14} className="animate-spin" />
                                            Running AI + Policy Engine...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Sparkles size={14} />
                                            ✨ AI Smart Distribute
                                            <ChevronRight size={13} />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Info banner about AI Distribute */}
                        <div className="mt-3 rounded-lg border border-amber-500/10 bg-amber-500/5 px-3 py-2">
                            <p className="text-[11px] text-amber-500/80">
                                <strong>AI Smart Distribute</strong> runs policy validation on each task, then uses Gemini AI to optimally assign tasks to team members based on workload, skills, and priority. You'll review and approve before anything is saved.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Assignment Review Modal */}
            <BulkAssignmentReviewModal
                isOpen={isBulkReviewOpen}
                onClose={() => setIsBulkReviewOpen(false)}
                mapping={modalMapping as any}
                employees={modalEmployees as any}
                onConfirm={handleConfirmDistribute}
                isSubmitting={isBulkAssigning}
            />
        </div>
    )
}
