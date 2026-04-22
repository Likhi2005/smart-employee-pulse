import { Archive, Copy, Eye, Pencil, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { TaskTemplateItem } from '@/types'

interface TaskTemplateCardProps {
    template: TaskTemplateItem
    onPreview: (template: TaskTemplateItem) => void
    onEdit: (template: TaskTemplateItem) => void
    onDuplicate: (template: TaskTemplateItem) => void
    onArchive: (template: TaskTemplateItem) => void
    isDeleting?: boolean
}

export function TaskTemplateCard({
    template,
    onPreview,
    onEdit,
    onDuplicate,
    onArchive,
    isDeleting = false,
}: TaskTemplateCardProps) {
    const [showActions, setShowActions] = useState(false)

    const priorityColor = {
        low: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        high: 'text-red-400 bg-red-500/10 border-red-500/30',
    }[template.defaultPriority || 'medium']

    const statusBadge = template.isActive
        ? { class: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', label: 'Active' }
        : { class: 'bg-neutral-800 text-neutral-400 border-neutral-700', label: 'Archived' }

    return (
        <div
            className="group relative rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900 hover:shadow-lg"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Header with title and status */}
            <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="truncate text-base font-semibold text-neutral-100">{template.name}</h3>
                    <p className="line-clamp-1 text-sm text-neutral-400">{template.title || 'No title'}</p>
                </div>
                <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium ${statusBadge.class}`}>
                    {statusBadge.label}
                </span>
            </div>

            {/* Description */}
            {template.description && (
                <p className="mb-3 line-clamp-2 text-sm text-neutral-300">{template.description}</p>
            )}

            {/* Meta grid */}
            <div className="mb-3 grid grid-cols-2 gap-2">
                {/* Priority badge */}
                <div className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs ${priorityColor}`}>
                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span className="font-medium capitalize">{template.defaultPriority || 'medium'}</span>
                </div>

                {/* Effort */}
                <div className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/50 px-2 py-1.5 text-xs text-neutral-300">
                    <span className="font-medium">{template.defaultEffort || 1}h</span>
                    <span className="text-neutral-500">effort</span>
                </div>

                {/* Mandatory indicator */}
                {template.defaultIsMandatory && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-xs text-red-400">
                        ⚠️ <span className="font-medium">Mandatory</span>
                    </div>
                )}

                {/* Department */}
                {template.department && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/50 px-2 py-1.5 text-xs text-neutral-300">
                        <span className="font-medium">{template.department}</span>
                    </div>
                )}
            </div>

            {/* Skills chips */}
            {template.skillsRequired?.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                    {template.skillsRequired.slice(0, 3).map((skill) => (
                        <span
                            key={skill}
                            className="inline-flex items-center rounded-full bg-blue-500/15 px-2 py-1 text-xs text-blue-300 border border-blue-500/30"
                        >
                            ◆ {skill}
                        </span>
                    ))}
                    {template.skillsRequired.length > 3 && (
                        <span className="inline-flex items-center rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-400">
                            +{template.skillsRequired.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Tags chips */}
            {template.tags?.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-1 text-xs text-amber-300 border border-amber-500/30"
                        >
                            # {tag}
                        </span>
                    ))}
                    {template.tags.length > 3 && (
                        <span className="inline-flex items-center rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-400">
                            +{template.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Footer with date and actions */}
            <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                <p className="text-xs text-neutral-500">
                    Created {new Date(template.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                </p>

                {/* Action buttons - show on hover or mobile */}
                <div
                    className={[
                        'flex items-center gap-1.5 transition-opacity',
                        showActions ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100',
                    ].join(' ')}
                >
                    <button
                        type="button"
                        onClick={() => onPreview(template)}
                        title="Preview template"
                        className="relative rounded-lg border border-neutral-700 bg-neutral-800 p-1.5 text-neutral-300 transition hover:bg-neutral-700 hover:text-neutral-100"
                    >
                        <Eye size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(template)}
                        title="Edit template"
                        className="relative rounded-lg border border-neutral-700 bg-neutral-800 p-1.5 text-neutral-300 transition hover:bg-neutral-700 hover:text-neutral-100"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDuplicate(template)}
                        title="Duplicate template"
                        className="relative rounded-lg border border-neutral-700 bg-neutral-800 p-1.5 text-neutral-300 transition hover:bg-neutral-700 hover:text-neutral-100"
                    >
                        <Copy size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onArchive(template)}
                        disabled={isDeleting}
                        title="Archive template"
                        className="relative rounded-lg border border-neutral-700 bg-neutral-800 p-1.5 text-neutral-300 transition hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 disabled:opacity-60"
                    >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
                    </button>
                </div>
            </div>
        </div>
    )
}