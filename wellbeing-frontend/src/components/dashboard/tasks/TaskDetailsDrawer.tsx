import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, PanelRightClose, CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { TaskItem } from '@/types'

interface TaskDetailsDrawerProps {
    open: boolean
    loading: boolean
    task: TaskItem | null
    onClose: () => void
    onApprove?: (taskId: string, notes?: string) => Promise<void>
    onReject?: (taskId: string, reason?: string) => Promise<void>
}

function formatDate(date?: string) {
    if (!date) return 'No due date'
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    })
}

function getAssignee(task: TaskItem | null) {
    if (!task) return 'Unassigned'
    if (typeof task.assignedTo === 'object' && task.assignedTo) return task.assignedTo.fullName
    return 'Unassigned'
}

function taskPublicId(task: TaskItem | null) {
    if (!task) return '-'
    return task.id || `TASK-${task._id.slice(-6).toUpperCase()}`
}

function DrawerContent({
    loading,
    task,
    onClose,
    onApprove,
    onReject,
}: {
    loading: boolean
    task: TaskItem | null
    onClose: () => void
    onApprove?: (taskId: string, notes?: string) => Promise<void>
    onReject?: (taskId: string, reason?: string) => Promise<void>
}) {
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)
    const [approvalNotes, setApprovalNotes] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')
    
    const isAwaitingApproval = task?.status === 'completed' && (task as any)?.taskState === 'REVIEW_PENDING'
    
    const handleApprove = async () => {
        if (!task || !onApprove) return
        setIsApproving(true)
        try {
            await onApprove(task._id, approvalNotes)
        } finally {
            setIsApproving(false)
        }
    }
    
    const handleReject = async () => {
        if (!task || !onReject || !rejectionReason.trim()) return
        setIsRejecting(true)
        try {
            await onReject(task._id, rejectionReason)
        } finally {
            setIsRejecting(false)
        }
    }

    const toggleRejectMode = () => {
        if (isRejecting) {
            setIsRejecting(false)
            setRejectionReason('')
        } else {
            setIsRejecting(true)
        }
    }
    return (
        <>
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Task Details</p>
                    <h3 className="mt-1 text-lg font-semibold text-neutral-50">
                        {task?.title || 'Loading...'}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500">{taskPublicId(task)}</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-300 hover:bg-neutral-800"
                >
                    <PanelRightClose size={16} />
                </button>
            </div>

            <div className="space-y-4 px-4 py-4">
                {loading ? (
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Loader2 size={16} className="animate-spin" />
                        Loading task details...
                    </div>
                ) : task ? (
                    <>
                        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-sm">
                            <div className="text-neutral-500">Assignee</div>
                            <div className="mt-1 font-medium text-neutral-100">{getAssignee(task)}</div>
                        </div>

                        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-sm">
                            <div className="text-neutral-500">Description</div>
                            <div className="mt-1 text-neutral-200">{task.description || 'No description'}</div>
                        </div>

                        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-sm">
                            <div className="text-neutral-500">Task Meta</div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-neutral-300">
                                <div>Priority: {task.priority}</div>
                                <div>Status: {task.status}</div>
                                <div>Risk: {task.riskLevel || 'low'}</div>
                                <div>Effort: {task.effort} hrs</div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-sm">
                            <div className="text-neutral-500">Timeline</div>
                            <div className="mt-2 space-y-1 text-neutral-300">
                                <div>Created: {formatDate(task.createdAt)}</div>
                                <div>Due: {formatDate(task.dueDate)}</div>
                                <div>Updated: {formatDate(task.updatedAt)}</div>
                            </div>
                        </div>

                        {isAwaitingApproval && (
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                    ⚠ Awaiting Manager Approval
                                </div>
                                
                                <div className="mt-3 space-y-3">
                                    <textarea
                                        value={approvalNotes}
                                        onChange={(e) => setApprovalNotes(e.target.value)}
                                        placeholder="Add approval notes (optional)"
                                        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
                                        rows={2}
                                    />
                                    
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleApprove}
                                            disabled={isApproving || isRejecting}
                                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isApproving ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Approving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={14} />
                                                    Approve
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={toggleRejectMode}
                                            disabled={isApproving}
                                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isRejecting ? (
                                                <>
                                                    <XCircle size={14} />
                                                    Cancel
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={14} />
                                                    Reject
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {isRejecting && (
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Reason for rejection (required)"
                                            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:border-red-500 focus:outline-none"
                                            rows={2}
                                        />
                                    )}

                                    {isRejecting && rejectionReason.trim() && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleReject}
                                                disabled={isApproving}
                                                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Confirm Rejection
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-neutral-400">No task details available.</p>
                )}
            </div>
        </>
    )
}

export function TaskDetailsDrawer({
    open,
    loading,
    task,
    onClose,
    onApprove,
    onReject,
}: TaskDetailsDrawerProps) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <div className="hidden min-h-[300px] rounded-2xl border border-neutral-800 bg-neutral-950 xl:sticky xl:top-20 xl:block">
                        <DrawerContent loading={loading} task={task} onClose={onClose} onApprove={onApprove} onReject={onReject} />
                    </div>

                    <motion.div
                        className="fixed inset-0 z-40 bg-black/70 xl:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.aside
                        className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-neutral-800 bg-neutral-950 shadow-2xl xl:hidden"
                        initial={{ x: 420, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 420, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <DrawerContent loading={loading} task={task} onClose={onClose} onApprove={onApprove} onReject={onReject} />
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}