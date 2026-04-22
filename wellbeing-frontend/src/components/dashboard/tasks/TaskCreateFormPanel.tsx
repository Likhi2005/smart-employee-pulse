import { useMemo, useState } from 'react'
import type { TaskPriority } from '@/types'

export interface DraftFormValues {
    title: string
    description: string
    effort: string
    priority: TaskPriority
    dueDate: string
    mandatory: boolean
}

export interface EnrichFormValues {
    department: string
    skills: string
    tags: string
    acceptanceCriteria: string
    dependencyRefs: string
}

interface TaskCreateFormPanelProps {
    step: 1 | 2
    draftValues: DraftFormValues
    enrichValues: EnrichFormValues
    onChangeDraft: (next: DraftFormValues) => void
    onChangeEnrich: (next: EnrichFormValues) => void
    onContinue: () => void
    onBack?: () => void
    isSubmitting?: boolean
}

export function TaskCreateFormPanel({
    step,
    draftValues,
    enrichValues,
    onChangeDraft,
    onChangeEnrich,
    onContinue,
    onBack,
    isSubmitting = false,
}: TaskCreateFormPanelProps) {
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    const errors = useMemo(() => {
        const next: Record<string, string> = {}
        if (!draftValues.title.trim()) next.title = 'Task title is required'
        if (!draftValues.effort.trim() || Number(draftValues.effort) < 1) next.effort = 'Effort must be >= 1'
        if (!draftValues.description.trim()) next.description = 'Description is required'
        return next
    }, [draftValues])

    const canContinueStep1 = Object.keys(errors).length === 0

    return (
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            {step === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-100">Draft Task</h3>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-neutral-200">Title</label>
                        <input
                            value={draftValues.title}
                            onChange={(e) => onChangeDraft({ ...draftValues, title: e.target.value })}
                            onBlur={() => setTouched((p) => ({ ...p, title: true }))}
                            className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                            placeholder="Ex: Incident review for payment retries"
                        />
                        {touched.title && errors.title && <p className="mt-1 text-xs text-red-300">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-neutral-200">Description</label>
                        <textarea
                            value={draftValues.description}
                            onChange={(e) => onChangeDraft({ ...draftValues, description: e.target.value })}
                            onBlur={() => setTouched((p) => ({ ...p, description: true }))}
                            rows={4}
                            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                            placeholder="Business context, expected outcomes, key constraints..."
                        />
                        {touched.description && errors.description && (
                            <p className="mt-1 text-xs text-red-300">{errors.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-200">Effort (hours)</label>
                            <input
                                value={draftValues.effort}
                                onChange={(e) => onChangeDraft({ ...draftValues, effort: e.target.value })}
                                onBlur={() => setTouched((p) => ({ ...p, effort: true }))}
                                className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                            />
                            {touched.effort && errors.effort && <p className="mt-1 text-xs text-red-300">{errors.effort}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-200">Priority</label>
                            <select
                                value={draftValues.priority}
                                onChange={(e) => onChangeDraft({ ...draftValues, priority: e.target.value as TaskPriority })}
                                className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                            >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-200">Due Date</label>
                            <input
                                type="date"
                                value={draftValues.dueDate}
                                onChange={(e) => onChangeDraft({ ...draftValues, dueDate: e.target.value })}
                                className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-neutral-200">Mandatory task</p>
                            <button
                                type="button"
                                onClick={() => onChangeDraft({ ...draftValues, mandatory: !draftValues.mandatory })}
                                className={[
                                    'relative h-6 w-11 rounded-full transition-colors',
                                    draftValues.mandatory ? 'bg-amber-500' : 'bg-neutral-700',
                                ].join(' ')}
                            >
                                <span
                                    className={[
                                        'absolute top-0.5 h-5 w-5 rounded-full bg-neutral-950 transition-transform',
                                        draftValues.mandatory ? 'translate-x-5' : 'translate-x-0.5',
                                    ].join(' ')}
                                />
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-red-200/80">Employee cannot reject if mandatory is enabled.</p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            disabled={!canContinueStep1 || isSubmitting}
                            onClick={onContinue}
                            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
                        >
                            Continue to Enrich
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-100">Enrich Task</h3>
                    <p className="text-sm text-neutral-400">These fields raise assignment quality and explainability.</p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-200">Department</label>
                            <input
                                value={enrichValues.department}
                                onChange={(e) => onChangeEnrich({ ...enrichValues, department: e.target.value })}
                                className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                                placeholder="Engineering"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-200">Skills (comma separated)</label>
                            <input
                                value={enrichValues.skills}
                                onChange={(e) => onChangeEnrich({ ...enrichValues, skills: e.target.value })}
                                className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                                placeholder="React, Node, Incident response"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-neutral-200">Tags</label>
                        <input
                            value={enrichValues.tags}
                            onChange={(e) => onChangeEnrich({ ...enrichValues, tags: e.target.value })}
                            className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                            placeholder="customer-impact, platform"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-neutral-200">Acceptance Criteria</label>
                        <textarea
                            value={enrichValues.acceptanceCriteria}
                            onChange={(e) => onChangeEnrich({ ...enrichValues, acceptanceCriteria: e.target.value })}
                            rows={3}
                            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                            placeholder="- RCA approved
- Dashboard alert noise reduced
- Postmortem published"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-neutral-200">Dependencies</label>
                        <input
                            value={enrichValues.dependencyRefs}
                            onChange={(e) => onChangeEnrich({ ...enrichValues, dependencyRefs: e.target.value })}
                            className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                            placeholder="TASK-1021, TASK-998"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={onBack}
                            className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={onContinue}
                            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-400"
                        >
                            Continue to Assign
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}