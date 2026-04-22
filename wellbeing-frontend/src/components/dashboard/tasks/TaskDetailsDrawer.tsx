import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, PanelRightClose } from 'lucide-react'
import type { TaskItem } from '@/types'

interface TaskDetailsDrawerProps {
    open: boolean
    loading: boolean
    task: TaskItem | null
    onClose: () => void
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
}: {
    loading: boolean
    task: TaskItem | null
    onClose: () => void
}) {
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
}: TaskDetailsDrawerProps) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <div className="hidden min-h-[300px] rounded-2xl border border-neutral-800 bg-neutral-950 xl:sticky xl:top-20 xl:block">
                        <DrawerContent loading={loading} task={task} onClose={onClose} />
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
                        <DrawerContent loading={loading} task={task} onClose={onClose} />
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}