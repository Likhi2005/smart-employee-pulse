import { X } from 'lucide-react'
import { useEffect } from 'react'
import type { TaskTemplateItem, TaskPriority } from '@/types'

interface TaskTemplatePreviewProps {
    template: TaskTemplateItem | null
    isOpen: boolean
    onClose: () => void
    onEdit: (template: TaskTemplateItem) => void
    onUseTemplate: (template: TaskTemplateItem) => void
}

export function TaskTemplatePreview({
    template,
    isOpen,
    onClose,
    onEdit,
    onUseTemplate,
}: TaskTemplatePreviewProps) {
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen || !template) return null

    const priorityColor: Record<TaskPriority, { class: string; label: string }> = {
        low: { class: 'text-blue-400 bg-blue-500/10 border-blue-500/30', label: 'Low' },
        medium: { class: 'text-amber-400 bg-amber-500/10 border-amber-500/30', label: 'Medium' },
        high: { class: 'text-red-400 bg-red-500/10 border-red-500/30', label: 'High' },
    }

    const priority = priorityColor[template.defaultPriority || 'medium']

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                role="button"
                tabIndex={-1}
            />

            <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
                <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
                    <div>
                        <p className="mb-1 text-xs uppercase tracking-[0.12em] text-neutral-500">Template Preview</p>
                        <h2 className="text-xl font-bold text-neutral-100">{template.name}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-300"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[calc(100vh-300px)] space-y-6 overflow-y-auto px-6 py-4">
                    <section>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">Basic Info</h3>
                        <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                            <div>
                                <label className="text-xs uppercase tracking-wide text-neutral-500">Template Name</label>
                                <p className="mt-1 text-base font-medium text-neutral-100">{template.name}</p>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-neutral-500">Default Task Title</label>
                                <p className="mt-1 text-base font-medium text-neutral-100">{template.title}</p>
                            </div>
                            {template.description && (
                                <div>
                                    <label className="text-xs uppercase tracking-wide text-neutral-500">Description</label>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-300">{template.description}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">Configuration</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
                                <label className="text-xs uppercase tracking-wide text-neutral-500">Priority</label>
                                <div className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium ${priority.class}`}>
                                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                    {priority.label}
                                </div>
                            </div>

                            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
                                <label className="text-xs uppercase tracking-wide text-neutral-500">Estimated Time</label>
                                <p className="mt-1 text-base font-medium text-neutral-100">{template.defaultEffort || 1} hour(s)</p>
                            </div>

                            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
                                <label className="text-xs uppercase tracking-wide text-neutral-500">Mandatory</label>
                                <p className="mt-1 text-sm font-medium">
                                    {template.defaultIsMandatory ? (
                                        <span className="text-red-400">Yes</span>
                                    ) : (
                                        <span className="text-emerald-400">Optional</span>
                                    )}
                                </p>
                            </div>

                            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
                                <label className="text-xs uppercase tracking-wide text-neutral-500">Status</label>
                                <p className="mt-1 text-sm font-medium">
                                    <span className={template.isActive ? 'text-emerald-400' : 'text-neutral-500'}>
                                        {template.isActive ? 'Active' : 'Archived'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">Assignment Rules</h3>
                        <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                            {template.department && (
                                <div>
                                    <label className="text-xs uppercase tracking-wide text-neutral-500">Department</label>
                                    <p className="mt-1 text-sm text-neutral-300">{template.department}</p>
                                </div>
                            )}

                            {!!template.skillsRequired?.length && (
                                <div>
                                    <label className="text-xs uppercase tracking-wide text-neutral-500">Required Skills</label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {template.skillsRequired.map((skill: string) => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-xs text-blue-300"
                                            >
                                                ◆ {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!template.department && !template.skillsRequired?.length && (
                                <p className="text-sm italic text-neutral-400">No specific assignment rules defined</p>
                            )}
                        </div>
                    </section>

                    {!!template.tags?.length && (
                        <section>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {template.tags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs text-amber-300"
                                    >
                                        # {tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-neutral-800 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onEdit(template)
                            onClose()
                        }}
                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-100 transition hover:bg-neutral-800"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onUseTemplate(template)
                            onClose()
                        }}
                        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400"
                    >
                        Use Template
                    </button>
                </div>
            </div>
        </>
    )
}