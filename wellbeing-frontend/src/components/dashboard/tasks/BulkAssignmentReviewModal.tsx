import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, Sparkles, ArrowRight, Save, Loader2, AlertTriangle,
    ChevronDown, CheckCircle2, ShieldCheck, ShieldAlert
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { EmployeeOption } from '@/services/taskService'

interface BulkMapping {
    taskId: string
    taskTitle: string
    employeeId: string
    employeeName: string
    effort: number
    projectedWorkload: number
    reason: string
    policyStatus?: string          // 'pass' | 'warn' | 'block'
    policyWarnings?: string[]
}

interface BulkAssignmentReviewModalProps {
    isOpen: boolean
    onClose: () => void
    mapping: BulkMapping[]
    employees: EmployeeOption[]
    onConfirm: (finalAssignments: Array<{ taskId: string; employeeId: string }>) => Promise<void>
    isSubmitting: boolean
}

function WorkloadBar({ base, added }: { base: number; added: number }) {
    const total = Math.min(100, base + added)
    const barColor = total > 90 ? 'bg-red-500' : total > 70 ? 'bg-amber-500' : 'bg-emerald-500'
    return (
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${total}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`h-full ${barColor}`}
            />
        </div>
    )
}

export function BulkAssignmentReviewModal({
    isOpen,
    onClose,
    mapping,
    employees,
    onConfirm,
    isSubmitting,
}: BulkAssignmentReviewModalProps) {
    const [localMapping, setLocalMapping] = useState<BulkMapping[]>([])

    useEffect(() => {
        if (isOpen) {
            setLocalMapping(mapping)
        }
    }, [isOpen, mapping])

    const handleAssigneeChange = (taskId: string, newEmployeeId: string) => {
        const emp = employees.find(e => e._id === newEmployeeId)
        if (!emp) return
        setLocalMapping(prev => prev.map(m => {
            if (m.taskId === taskId) {
                return {
                    ...m,
                    employeeId: newEmployeeId,
                    employeeName: emp.fullName,
                    reason: 'Manual override by manager.',
                }
            }
            return m
        }))
    }

    // Calculate workload impact per employee
    const employeeStats = useMemo(() => {
        const stats: Record<string, { base: number; added: number; name: string }> = {}
        employees.forEach(e => {
            stats[e._id] = { base: Number(e.currentWorkload || 0), added: 0, name: e.fullName }
        })
        localMapping.forEach(m => {
            if (stats[m.employeeId]) {
                stats[m.employeeId].added += (m.effort || 4)
            }
        })
        return stats
    }, [localMapping, employees])

    const hasWarnings = localMapping.some(m => m.policyStatus === 'warn')

    const policyBadge = (status?: string) => {
        if (status === 'warn') return (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                <ShieldAlert size={10} /> Policy Warning
            </span>
        )
        if (status === 'pass' || !status) return (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <ShieldCheck size={10} /> Policy OK
            </span>
        )
        return null
    }

    const priorityColor = (p?: string) => {
        if (p === 'high') return 'text-red-400'
        if (p === 'medium') return 'text-amber-400'
        return 'text-emerald-400'
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" className="overflow-hidden">
            <div className="flex max-h-[92vh] flex-col bg-neutral-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-800 p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                            <Sparkles size={20} className="text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-100">AI Smart Distribution Review</h2>
                            <p className="text-xs text-neutral-400">
                                {localMapping.length} tasks · Policy validated · Review and override before confirming
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100">
                        <X size={18} />
                    </button>
                </div>

                {/* Warning banner if policy warnings exist */}
                {hasWarnings && (
                    <div className="flex items-start gap-2 border-b border-amber-900/30 bg-amber-500/5 px-5 py-2.5">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
                        <p className="text-xs text-amber-300">
                            Some tasks have policy warnings (e.g. near deadlines, high team workload). Review them below before confirming.
                        </p>
                    </div>
                )}

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Task Assignments */}
                    <div className="flex-1 overflow-y-auto p-5">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Proposed Assignments
                        </p>
                        <div className="space-y-3">
                            {localMapping.map((item, idx) => (
                                <motion.div
                                    key={item.taskId}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className={`rounded-xl border bg-neutral-950/50 p-4 transition-colors ${
                                        item.policyStatus === 'warn'
                                            ? 'border-amber-500/30'
                                            : 'border-neutral-800 hover:border-neutral-700'
                                    }`}
                                >
                                    {/* Task title + badges */}
                                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-bold text-neutral-400">
                                                    {idx + 1}
                                                </span>
                                                <h4 className="font-medium text-neutral-200">{item.taskTitle}</h4>
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                {policyBadge(item.policyStatus)}
                                                <span className="text-[10px] text-neutral-500">{item.effort}h effort</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Policy warnings */}
                                    {item.policyWarnings && item.policyWarnings.length > 0 && (
                                        <div className="mb-3 rounded-lg bg-amber-950/30 px-3 py-2">
                                            {item.policyWarnings.map((w, wi) => (
                                                <p key={wi} className="flex items-center gap-1 text-[11px] text-amber-300">
                                                    <AlertTriangle size={10} /> {w}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    {/* Assignment row */}
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <select
                                                value={item.employeeId}
                                                onChange={(e) => handleAssigneeChange(item.taskId, e.target.value)}
                                                className="w-full appearance-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 pr-8 text-sm text-neutral-200 outline-none focus:border-amber-500/50"
                                            >
                                                {employees.map(emp => (
                                                    <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="pointer-events-none absolute right-3 top-3 text-neutral-500" />
                                        </div>
                                        <div className="text-neutral-600">
                                            <ArrowRight size={14} />
                                        </div>
                                        <div className="flex-1 rounded-lg bg-amber-500/5 border border-amber-500/15 px-3 py-2 text-sm font-medium text-amber-400">
                                            {item.employeeName}
                                        </div>
                                    </div>

                                    {/* AI reason */}
                                    <p className="mt-2 flex items-start gap-1.5 text-[11px] text-neutral-500">
                                        <Sparkles size={10} className="mt-0.5 shrink-0 text-amber-500/60" />
                                        {item.reason}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Workload Impact */}
                    <div className="w-72 shrink-0 overflow-y-auto border-l border-neutral-800 bg-neutral-950/20 p-5">
                        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Team Workload Impact
                        </p>
                        <div className="space-y-5">
                            {Object.entries(employeeStats)
                                .filter(([, stat]) => stat.added > 0 || true)
                                .map(([id, stat]) => {
                                    const total = Math.min(100, stat.base + stat.added)
                                    const isOverloaded = total > 90
                                    const hasNewTasks = stat.added > 0

                                    return (
                                        <div key={id} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className={`font-medium ${hasNewTasks ? 'text-neutral-200' : 'text-neutral-500'}`}>
                                                    {stat.name}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {hasNewTasks && (
                                                        <span className="text-[10px] text-neutral-500">
                                                            +{stat.added}h
                                                        </span>
                                                    )}
                                                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                                        isOverloaded ? 'bg-red-400/10 text-red-400' :
                                                        total > 70 ? 'bg-amber-400/10 text-amber-400' :
                                                        'bg-emerald-400/10 text-emerald-400'
                                                    }`}>
                                                        {total}%
                                                    </span>
                                                </div>
                                            </div>
                                            <WorkloadBar base={stat.base} added={stat.added} />
                                            {isOverloaded && (
                                                <p className="flex items-center gap-1 text-[10px] text-red-400">
                                                    <AlertTriangle size={9} /> Exceeds capacity
                                                </p>
                                            )}
                                        </div>
                                    )
                                })}
                        </div>

                        {/* AI note */}
                        <div className="mt-6 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3.5">
                            <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                                <Sparkles size={12} /> AI Optimization
                            </p>
                            <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-400">
                                Gemini AI balanced tasks across the team using real-time workload, skill matching, and priority signals. You can override any assignment before confirming.
                            </p>
                        </div>

                        {/* Policy summary */}
                        <div className="mt-3 rounded-xl border border-neutral-800 p-3.5">
                            <p className="text-xs font-semibold text-neutral-400">Policy Summary</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-500">Passed</span>
                                    <span className="font-bold text-emerald-400">
                                        {localMapping.filter(m => m.policyStatus === 'pass' || !m.policyStatus).length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-500">Warnings</span>
                                    <span className="font-bold text-amber-400">
                                        {localMapping.filter(m => m.policyStatus === 'warn').length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-neutral-800 p-5">
                    <p className="text-xs text-neutral-500">
                        {localMapping.length} tasks will be created and assigned
                    </p>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => onConfirm(localMapping.map(m => ({ taskId: m.taskId, employeeId: m.employeeId })))}
                            disabled={isSubmitting}
                            className="bg-amber-500 font-bold text-neutral-950 hover:bg-amber-400 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin" />
                                    Creating & Assigning...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 size={14} />
                                    Confirm & Create {localMapping.length} Tasks
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
