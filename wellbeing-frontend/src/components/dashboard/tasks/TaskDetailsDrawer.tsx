import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, PanelRightClose, CheckCircle2, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { TaskItem } from '@/types'

interface TaskDetailsDrawerProps {
    open: boolean
    loading: boolean
    task: TaskItem | null
    onClose: () => void
    onReject?: (taskId: string, reason?: string) => Promise<void>
    onUpdate?: (taskId: string, payload: any) => Promise<void>
    initialMode?: 'view' | 'edit'
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
    onUpdate,
    initialMode,
}: {
    loading: boolean
    task: TaskItem | null
    onClose: () => void
    onApprove?: (taskId: string, notes?: string) => Promise<void>
    onReject?: (taskId: string, reason?: string) => Promise<void>
    onUpdate?: (taskId: string, payload: any) => Promise<void>
    initialMode?: 'view' | 'edit'
}) {
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isEditing, setIsEditing] = useState(initialMode === 'edit')
    const [approvalNotes, setApprovalNotes] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')

    // Form state
    const [title, setTitle] = useState(task?.title || '')
    const [description, setDescription] = useState(task?.description || '')
    const [priority, setPriority] = useState(task?.priority || 'medium')
    const [effort, setEffort] = useState(String(task?.effort || ''))
    const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : '')

    const isAwaitingApproval = task?.status === 'completed' && (task as any)?.taskState === 'REVIEW_PENDING'
    const isRestricted = ['in-progress', 'completed', 'accepted'].includes(task?.status || '') || (task as any)?.taskState === 'APPROVED'

    useEffect(() => {
        if (task) {
            setTitle(task.title)
            setDescription(task.description || '')
            setPriority(task.priority)
            setEffort(String(task.effort))
            setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '')
        }
    }, [task])

    const handleUpdate = async () => {
        if (!task || !onUpdate) return
        setIsUpdating(true)
        try {
            await onUpdate(task._id, {
                title,
                description,
                priority,
                effort: Number(effort),
                dueDate,
            })
            setIsEditing(false)
        } finally {
            setIsUpdating(false)
        }
    }
    
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
                        {isEditing ? (
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent border-b border-neutral-700 focus:border-amber-500 focus:outline-none"
                            />
                        ) : (
                            task?.title || 'Loading...'
                        )}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500">{taskPublicId(task)}</p>
                </div>
                <div className="flex gap-2">
                    {!isEditing && !isRestricted && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
                        >
                            Edit
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-300 hover:bg-neutral-800"
                    >
                        <PanelRightClose size={16} />
                    </button>
                </div>
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
                            <div className="mt-1 text-neutral-200">
                                {isEditing ? (
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-transparent border border-neutral-700 rounded-md p-2 focus:border-amber-500 focus:outline-none"
                                        rows={3}
                                    />
                                ) : (
                                    task.description || 'No description'
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-sm">
                            <div className="text-neutral-500">Task Meta</div>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-neutral-300">
                                <div>
                                    <label className="text-xs text-neutral-500 block mb-1">Priority</label>
                                    {isEditing ? (
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value as any)}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-1"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    ) : (
                                        task.priority
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 block mb-1">Status</label>
                                    <span className="text-neutral-100">{task.status}</span>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 block mb-1">Effort (hrs)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={effort}
                                            onChange={(e) => setEffort(e.target.value)}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-1"
                                        />
                                    ) : (
                                        task.effort
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 block mb-1">Due Date</label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-1"
                                        />
                                    ) : (
                                        formatDate(task.dueDate)
                                    )}
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdate}
                                    disabled={isUpdating}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-black hover:bg-amber-600 disabled:opacity-50"
                                >
                                    {isUpdating ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-neutral-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

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
    onUpdate,
    initialMode,
}: TaskDetailsDrawerProps) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <div className="hidden min-h-[300px] rounded-2xl border border-neutral-800 bg-neutral-950 xl:sticky xl:top-20 xl:block">
                        <DrawerContent 
                            loading={loading} 
                            task={task} 
                            onClose={onClose} 
                            onApprove={onApprove} 
                            onReject={onReject} 
                            onUpdate={onUpdate}
                            initialMode={initialMode}
                        />
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
                        <DrawerContent 
                            loading={loading} 
                            task={task} 
                            onClose={onClose} 
                            onApprove={onApprove} 
                            onReject={onReject} 
                            onUpdate={onUpdate}
                            initialMode={initialMode}
                        />
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}