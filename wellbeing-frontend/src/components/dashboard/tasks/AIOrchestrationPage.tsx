import { useState } from 'react'
import { TaskBulkCreatePanel } from './TaskBulkCreatePanel'
import { createBulkTasks } from '@/services/taskService'

export function AIOrchestrationPage() {
    const [isCreatingTask, setIsCreatingTask] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleBulkCreate = async (tasks: any[]) => {
        setIsCreatingTask(true)
        setError('')
        setSuccess('')
        try {
            await createBulkTasks(tasks)
            setSuccess(`Successfully created ${tasks.length} tasks.`)
            setTimeout(() => {
                window.location.href = '/dashboard/manager/tasks'
            }, 2000)
        } catch (err: any) {
            const apiMessage = err?.response?.data?.message
            const validationErrors = err?.response?.data?.errors
            const localMessage = err?.message

            if (Array.isArray(validationErrors) && validationErrors.length > 0) {
                setError(validationErrors.map((e: any) => e.msg).join(' | '))
            } else {
                setError(apiMessage || localMessage || 'Bulk creation failed.')
            }
        } finally {
            setIsCreatingTask(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-6">
                <h2 className="text-lg font-bold text-amber-500">AI Orchestration Center</h2>
                <p className="mt-1 text-sm text-neutral-400">
                    Use Gemini AI to instantly break down complex project goals into assigned sub-tasks.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-300">
                    {success}
                </div>
            )}

            <TaskBulkCreatePanel
                onTasksCreated={() => {}}
                onBulkCreate={handleBulkCreate}
                isSubmitting={isCreatingTask}
            />
        </div>
    )
}
