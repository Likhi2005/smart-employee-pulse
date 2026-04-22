import { X, ChevronDown, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { CreateTaskTemplatePayload, UpdateTaskTemplatePayload, TaskTemplateItem } from '@/types'

interface TaskTemplateFormProps {
    isOpen: boolean
    mode: 'create' | 'edit'
    initialData?: TaskTemplateItem
    onClose: () => void
    onSubmit: (payload: CreateTaskTemplatePayload | UpdateTaskTemplatePayload) => Promise<void>
    isLoading?: boolean
    error?: string
}

interface FormState {
    name: string
    title: string
    description: string
    defaultPriority: 'low' | 'medium' | 'high'
    defaultEffort: string
    defaultIsMandatory: boolean
    department: string
    skillsInput: string
    skillsList: string[]
    tagsInput: string
    tagsList: string[]
    isActive: boolean
}

const defaultForm: FormState = {
    name: '',
    title: '',
    description: '',
    defaultPriority: 'medium',
    defaultEffort: '1',
    defaultIsMandatory: false,
    department: '',
    skillsInput: '',
    skillsList: [],
    tagsInput: '',
    tagsList: [],
    isActive: true,
}

export function TaskTemplateForm({
    isOpen,
    mode,
    initialData,
    onClose,
    onSubmit,
    isLoading = false,
    error: errorProp = '',
}: TaskTemplateFormProps) {
    const [form, setForm] = useState<FormState>(defaultForm)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Set<string>>(new Set())

    // Initialize form from data
    useEffect(() => {
        if (!isOpen) return

        if (mode === 'edit' && initialData) {
            setForm({
                name: initialData.name,
                title: initialData.title,
                description: initialData.description || '',
                defaultPriority: initialData.defaultPriority || 'medium',
                defaultEffort: String(initialData.defaultEffort || 1),
                defaultIsMandatory: initialData.defaultIsMandatory || false,
                department: initialData.department || '',
                skillsInput: '',
                skillsList: initialData.skillsRequired || [],
                tagsInput: '',
                tagsList: initialData.tags || [],
                isActive: initialData.isActive !== false,
            })
        } else {
            setForm(defaultForm)
        }
        setErrors({})
        setTouched(new Set())
    }, [isOpen, mode, initialData])

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                handleSubmit()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    // Validation
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!form.name.trim()) newErrors.name = 'Template name is required'
        else if (form.name.length < 3) newErrors.name = 'Name must be at least 3 characters'
        else if (form.name.length > 100) newErrors.name = 'Name must be less than 100 characters'

        if (!form.title.trim()) newErrors.title = 'Default task title is required'
        else if (form.title.length < 3) newErrors.title = 'Title must be at least 3 characters'
        else if (form.title.length > 150) newErrors.title = 'Title must be less than 150 characters'

        if (form.description && form.description.length > 1000) newErrors.description = 'Description must be less than 1000 characters'

        if (Number(form.defaultEffort) < 1) newErrors.defaultEffort = 'Effort must be at least 1 hour'
        if (Number(form.defaultEffort) > 1000) newErrors.defaultEffort = 'Effort must be less than 1000 hours'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle skill addition
    const handleAddSkill = () => {
        const skill = form.skillsInput.trim()
        if (!skill) return
        if (form.skillsList.includes(skill)) return

        setForm((p) => ({
            ...p,
            skillsList: [...p.skillsList, skill],
            skillsInput: '',
        }))
    }

    // Handle skill removal
    const handleRemoveSkill = (skill: string) => {
        setForm((p) => ({
            ...p,
            skillsList: p.skillsList.filter((s) => s !== skill),
        }))
    }

    // Handle tag addition
    const handleAddTag = () => {
        const tag = form.tagsInput.trim()
        if (!tag) return
        if (form.tagsList.includes(tag)) return

        setForm((p) => ({
            ...p,
            tagsList: [...p.tagsList, tag],
            tagsInput: '',
        }))
    }

    // Handle tag removal
    const handleRemoveTag = (tag: string) => {
        setForm((p) => ({
            ...p,
            tagsList: p.tagsList.filter((t) => t !== tag),
        }))
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        const payload: CreateTaskTemplatePayload | UpdateTaskTemplatePayload = {
            name: form.name.trim(),
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            defaultPriority: form.defaultPriority,
            defaultEffort: Number(form.defaultEffort),
            defaultIsMandatory: form.defaultIsMandatory,
            department: form.department.trim() || undefined,
            skillsRequired: form.skillsList,
            tags: form.tagsList,
            ...(mode === 'edit' && { isActive: form.isActive }),
        }

        try {
            await onSubmit(payload)
            onClose()
        } catch (e) {
            // Error is handled by parent
        }
    }

    const isValid = useMemo(() => {
        return form.name.trim() && form.title.trim() && Number(form.defaultEffort) >= 1
    }, [form.name, form.title, form.defaultEffort])

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                role="button"
                tabIndex={-1}
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 flex-shrink-0">
                    <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-neutral-500 mb-1">
                            {mode === 'create' ? 'Create New' : 'Edit'} Template
                        </p>
                        <h2 className="text-xl font-bold text-neutral-100">
                            {mode === 'create' ? '+ Create Template' : 'Edit Template'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-300"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 px-6 py-4">
                    <div className="space-y-6">
                        {/* Error banner */}
                        {(errorProp || Object.values(errors).some(Boolean)) && (
                            <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3">
                                <p className="text-sm text-red-300">
                                    {errorProp || 'Please fix the errors below'}
                                </p>
                            </div>
                        )}

                        {/* Basic Info Section */}
                        <section>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs text-amber-400">1</span>
                                Basic Info
                            </h3>

                            <div className="space-y-3">
                                {/* Template Name */}
                                <div>
                                    <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                        Template Name *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="e.g., API Development Task"
                                        value={form.name}
                                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                        onBlur={() => setTouched((p) => new Set([...p, 'name']))}
                                        className={[
                                            'mt-1.5 h-10 w-full rounded-lg border bg-neutral-900 px-3 text-sm text-neutral-100 outline-none transition',
                                            errors.name && touched.has('name')
                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                                                : 'border-neutral-700 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20',
                                        ].join(' ')}
                                    />
                                    {errors.name && touched.has('name') && (
                                        <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                                    )}
                                </div>

                                {/* Default Task Title */}
                                <div>
                                    <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                        Default Task Title *
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        placeholder="e.g., Build REST API Endpoint"
                                        value={form.title}
                                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                        onBlur={() => setTouched((p) => new Set([...p, 'title']))}
                                        className={[
                                            'mt-1.5 h-10 w-full rounded-lg border bg-neutral-900 px-3 text-sm text-neutral-100 outline-none transition',
                                            errors.title && touched.has('title')
                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                                                : 'border-neutral-700 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20',
                                        ].join(' ')}
                                    />
                                    {errors.title && touched.has('title') && (
                                        <p className="mt-1 text-xs text-red-400">{errors.title}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        placeholder="Optional description for reference..."
                                        value={form.description}
                                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                        onBlur={() => setTouched((p) => new Set([...p, 'description']))}
                                        rows={3}
                                        className={[
                                            'mt-1.5 w-full rounded-lg border bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition resize-none',
                                            errors.description && touched.has('description')
                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                                                : 'border-neutral-700 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20',
                                        ].join(' ')}
                                    />
                                    {errors.description && touched.has('description') && (
                                        <p className="mt-1 text-xs text-red-400">{errors.description}</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Task Configuration Section */}
                        <section>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs text-amber-400">2</span>
                                Task Configuration
                            </h3>

                            <div className="grid gap-3">
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Priority */}
                                    <div>
                                        <label htmlFor="priority" className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                            Priority
                                        </label>
                                        <div className="relative mt-1.5">
                                            <select
                                                id="priority"
                                                value={form.defaultPriority}
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        defaultPriority: e.target.value as 'low' | 'medium' | 'high',
                                                    }))
                                                }
                                                className="h-10 w-full appearance-none rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none transition focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500" />
                                        </div>
                                    </div>

                                    {/* Effort */}
                                    <div>
                                        <label htmlFor="effort" className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                            Estimated Effort (hours)
                                        </label>
                                        <input
                                            id="effort"
                                            type="number"
                                            min="1"
                                            max="1000"
                                            value={form.defaultEffort}
                                            onChange={(e) => setForm((p) => ({ ...p, defaultEffort: e.target.value }))}
                                            onBlur={() => setTouched((p) => new Set([...p, 'defaultEffort']))}
                                            className={[
                                                'mt-1.5 h-10 w-full rounded-lg border bg-neutral-900 px-3 text-sm text-neutral-100 outline-none transition',
                                                errors.defaultEffort && touched.has('defaultEffort')
                                                    ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                                                    : 'border-neutral-700 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20',
                                            ].join(' ')}
                                        />
                                        {errors.defaultEffort && touched.has('defaultEffort') && (
                                            <p className="mt-1 text-xs text-red-400">{errors.defaultEffort}</p>
                                        )}
                                    </div>

                                    {/* Mandatory */}
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400 block mb-1.5">
                                            Mandatory
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setForm((p) => ({ ...p, defaultIsMandatory: !p.defaultIsMandatory }))}
                                            className={[
                                                'h-10 w-full rounded-lg border font-medium text-sm transition',
                                                form.defaultIsMandatory
                                                    ? 'border-red-500/50 bg-red-500/10 text-red-300'
                                                    : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800',
                                            ].join(' ')}
                                        >
                                            {form.defaultIsMandatory ? '✓ Mandatory' : '◯ Optional'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Assignment Rules Section */}
                        <section>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs text-amber-400">3</span>
                                Assignment Rules
                            </h3>

                            <div className="space-y-3">
                                {/* Department */}
                                <div>
                                    <label htmlFor="department" className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                        Department (Optional)
                                    </label>
                                    <input
                                        id="department"
                                        type="text"
                                        placeholder="e.g., Backend, Frontend, QA"
                                        value={form.department}
                                        onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                                        className="mt-1.5 h-10 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none transition focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20"
                                    />
                                </div>

                                {/* Skills */}
                                <div>
                                    <label htmlFor="skillsInput" className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                        Required Skills (press Enter to add)
                                    </label>
                                    <div className="mt-1.5 flex gap-2">
                                        <input
                                            id="skillsInput"
                                            type="text"
                                            placeholder="e.g., React, API Design"
                                            value={form.skillsInput}
                                            onChange={(e) => setForm((p) => ({ ...p, skillsInput: e.target.value }))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    handleAddSkill()
                                                }
                                            }}
                                            className="flex-1 h-10 rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none transition focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddSkill}
                                            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {form.skillsList.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {form.skillsList.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-1 text-xs text-blue-300 border border-blue-500/30"
                                                >
                                                    ◆ {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        className="text-blue-400 hover:text-blue-300"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Metadata Section */}
                        <section>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs text-amber-400">4</span>
                                Metadata
                            </h3>

                            <div className="space-y-3">
                                {/* Tags */}
                                <div>
                                    <label htmlFor="tagsInput" className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                        Tags (press Enter to add)
                                    </label>
                                    <div className="mt-1.5 flex gap-2">
                                        <input
                                            id="tagsInput"
                                            type="text"
                                            placeholder="e.g., customer, platform"
                                            value={form.tagsInput}
                                            onChange={(e) => setForm((p) => ({ ...p, tagsInput: e.target.value }))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    handleAddTag()
                                                }
                                            }}
                                            className="flex-1 h-10 rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none transition focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {form.tagsList.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {form.tagsList.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs text-amber-300 border border-amber-500/30"
                                                >
                                                    # {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="text-amber-400 hover:text-amber-300"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Status toggle (edit mode only) */}
                                {mode === 'edit' && (
                                    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 flex items-center justify-between">
                                        <label className="text-sm font-medium text-neutral-200">Template Status</label>
                                        <button
                                            type="button"
                                            onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                                            className={[
                                                'relative h-6 w-11 rounded-full transition-colors',
                                                form.isActive ? 'bg-emerald-500' : 'bg-neutral-700',
                                            ].join(' ')}
                                        >
                                            <span
                                                className={[
                                                    'absolute top-0.5 h-5 w-5 rounded-full bg-neutral-950 transition-transform',
                                                    form.isActive ? 'translate-x-5' : 'translate-x-0.5',
                                                ].join(' ')}
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-neutral-800 px-6 py-4 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isValid || isLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400 disabled:opacity-60"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        {mode === 'create' ? 'Create Template' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </>
    )
}