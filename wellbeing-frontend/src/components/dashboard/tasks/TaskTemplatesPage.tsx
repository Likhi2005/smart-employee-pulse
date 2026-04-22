import { Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TaskTemplateCard } from './TaskTemplateCard'
import { TaskTemplateForm } from './TaskTemplateForm'
import { TaskTemplatePreview } from './TaskTemplatePreview'
import { TemplateFiltersBar } from './TemplateFiltersBar'
import {
    listTemplates,
    deleteTemplate,
    duplicateTemplate,
    updateTemplate,
    createTemplate,
    extractDepartments,
    type TemplateListParams,
} from '@/services/templateService'
import type { TaskTemplateItem, CreateTaskTemplatePayload, UpdateTaskTemplatePayload } from '@/types'

type FormMode = 'create' | 'edit'

interface Toast {
    type: 'success' | 'error'
    message: string
    id: string
}

const SkeletonCard = () => (
    <div className="animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <div className="mb-3 space-y-2">
            <div className="h-5 w-1/2 rounded bg-neutral-800" />
            <div className="h-4 w-2/3 rounded bg-neutral-800" />
        </div>
        <div className="mb-3 space-y-2">
            <div className="h-4 w-full rounded bg-neutral-800" />
            <div className="h-4 w-full rounded bg-neutral-800" />
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div className="h-8 rounded bg-neutral-800" />
            <div className="h-8 rounded bg-neutral-800" />
        </div>
    </div>
)

export function TaskTemplatesPage() {
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const [toasts, setToasts] = useState<Toast[]>([])

    const [templates, setTemplates] = useState<TaskTemplateItem[]>([])
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const [filters, setFilters] = useState<TemplateListParams>({
        search: '',
        department: '',
        includeInactive: false,
        page: 1,
        limit: 12,
    })

    const [formMode, setFormMode] = useState<FormMode>('create')
    const [formOpen, setFormOpen] = useState(false)
    const [formData, setFormData] = useState<TaskTemplateItem | undefined>()
    const [previewData, setPreviewData] = useState<TaskTemplateItem | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

    const departments = useMemo(() => extractDepartments(templates), [templates])
    const hasActiveFilters = useMemo(
        () => !!filters.search || !!filters.department || filters.includeInactive === true,
        [filters]
    )

    const showToast = useCallback((type: 'success' | 'error', message: string) => {
        const id = Date.now().toString()
        setToasts((prev) => [...prev, { type, message, id }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3000)
    }, [])

    const loadTemplates = useCallback(async (params = filters) => {
        setIsLoading(true)
        setError('')
        try {
            const response = await listTemplates(params)
            setTemplates(response.templates)
            setTotalItems(response.meta.total)
            setTotalPages(response.meta.totalPages)
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to load templates'
            setError(message)
            showToast('error', message)
        } finally {
            setIsLoading(false)
        }
    }, [filters, showToast])

    useEffect(() => {
        loadTemplates()
    }, [filters, loadTemplates])

    const handleCreateTemplate = () => {
        setFormMode('create')
        setFormData(undefined)
        setFormOpen(true)
    }

    const handleEditTemplate = (template: TaskTemplateItem) => {
        setFormMode('edit')
        setFormData(template)
        setFormOpen(true)
    }

    const handleFormSubmit = async (payload: CreateTaskTemplatePayload | UpdateTaskTemplatePayload) => {
        setIsSaving(true)
        setError('')
        try {
            if (formMode === 'create') {
                await createTemplate(payload as CreateTaskTemplatePayload)
                showToast('success', 'Template created successfully')
            } else if (formData?._id) {
                await updateTemplate(formData._id, payload as UpdateTaskTemplatePayload)
                showToast('success', 'Template updated successfully')
            }
            setFormOpen(false)
            await loadTemplates()
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to save template'
            setError(message)
            showToast('error', message)
        } finally {
            setIsSaving(false)
        }
    }

    const handlePreviewTemplate = (template: TaskTemplateItem) => {
        setPreviewData(template)
        setPreviewOpen(true)
    }

    const handleUseTemplate = (template: TaskTemplateItem) => {
        navigate(`/dashboard/manager/tasks?section=create&templateId=${template._id}`)
    }

    const handleArchiveTemplate = async (template: TaskTemplateItem) => {
        setDeletingId(template._id)
        try {
            await deleteTemplate(template._id)
            showToast('success', 'Template archived successfully')
            await loadTemplates()
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to archive template'
            showToast('error', message)
        } finally {
            setDeletingId(null)
        }
    }

    const handleDuplicateTemplate = async (template: TaskTemplateItem) => {
        setDuplicatingId(template._id)
        const newName = `${template.name} (Copy)`
        try {
            await duplicateTemplate(template._id, newName)
            showToast('success', `Template duplicated as "${newName}"`)
            await loadTemplates()
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to duplicate template'
            showToast('error', message)
        } finally {
            setDuplicatingId(null)
        }
    }

    const handleFilterChange = useCallback((newFilters: Partial<TemplateListParams>) => {
        setFilters((prev) => {
            const next: TemplateListParams = {
                ...prev,
                ...newFilters,
                page: newFilters.page ?? 1,
            }

            const same =
                prev.search === next.search &&
                prev.department === next.department &&
                prev.includeInactive === next.includeInactive &&
                prev.page === next.page &&
                prev.limit === next.limit

            return same ? prev : next
        })
    }, [])

    const handleSearchChange = useCallback((search: string) => {
        handleFilterChange({ search, page: 1 })
    }, [handleFilterChange])

    const handleDepartmentChange = useCallback((department: string) => {
        handleFilterChange({ department, page: 1 })
    }, [handleFilterChange])

    const handleIncludeInactiveChange = useCallback((includeInactive: boolean) => {
        handleFilterChange({ includeInactive, page: 1 })
    }, [handleFilterChange])

    const handleResetFilters = useCallback(() => {
        setFilters({
            search: '',
            department: '',
            includeInactive: false,
            page: 1,
            limit: 12,
        })
    }, [])

    return (
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="border-b border-neutral-800 px-4 py-6 sm:px-6">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Task Studio</p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-50">Task Templates</h1>
                        <p className="mt-2 text-sm text-neutral-400">
                            Create and manage reusable templates for faster task creation.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreateTemplate}
                        className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400"
                    >
                        <Plus size={16} />
                        Create Template
                    </button>
                </div>

                <TemplateFiltersBar
                    search={filters.search || ''}
                    onSearchChange={handleSearchChange}
                    department={filters.department || ''}
                    onDepartmentChange={handleDepartmentChange}
                    departments={departments}
                    includeInactive={filters.includeInactive || false}
                    onIncludeInactiveChange={handleIncludeInactiveChange}
                    onReset={handleResetFilters}
                    hasActiveFilters={hasActiveFilters}
                />

                {error && (
                    <div className="mt-4 rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}
            </div>

            <div className="px-4 py-6 sm:px-6">
                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center">
                        <div className="mb-4 text-4xl">📋</div>
                        <h2 className="text-lg font-semibold text-neutral-200">No templates yet</h2>
                        <p className="mt-2 text-sm text-neutral-400">
                            {hasActiveFilters
                                ? 'No templates match your filters. Try adjusting filters.'
                                : 'Create reusable templates to speed up task creation.'}
                        </p>
                        <button
                            type="button"
                            onClick={handleCreateTemplate}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400"
                        >
                            <Plus size={16} />
                            Create Your First Template
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {templates.map((template) => (
                                <TaskTemplateCard
                                    key={template._id}
                                    template={template}
                                    onPreview={handlePreviewTemplate}
                                    onEdit={handleEditTemplate}
                                    onDuplicate={handleDuplicateTemplate}
                                    onArchive={handleArchiveTemplate}
                                    isDeleting={deletingId === template._id || duplicatingId === template._id}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3">
                                <p className="text-sm text-neutral-400">
                                    Showing{' '}
                                    <span className="font-semibold text-neutral-200">
                                        {(filters.page! - 1) * filters.limit! + 1}-
                                        {Math.min(filters.page! * filters.limit!, totalItems)}
                                    </span>{' '}
                                    of <span className="font-semibold text-neutral-200">{totalItems}</span> templates
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleFilterChange({ page: (filters.page || 1) - 1 })}
                                        disabled={(filters.page || 1) <= 1}
                                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800 disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <span className="text-sm text-neutral-400">
                                        Page {filters.page} of {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleFilterChange({ page: (filters.page || 1) + 1 })}
                                        disabled={(filters.page || 1) >= totalPages}
                                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <TaskTemplateForm
                isOpen={formOpen}
                mode={formMode}
                initialData={formData}
                onClose={() => setFormOpen(false)}
                onSubmit={handleFormSubmit}
                isLoading={isSaving}
                error={error}
            />

            <TaskTemplatePreview
                template={previewData}
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                onEdit={handleEditTemplate}
                onUseTemplate={handleUseTemplate}
            />

            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={[
                            'rounded-lg px-4 py-3 text-sm font-medium',
                            toast.type === 'success'
                                ? 'border border-emerald-900/40 bg-emerald-950/20 text-emerald-300'
                                : 'border border-red-900/40 bg-red-950/20 text-red-300',
                        ].join(' ')}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </section>
    )
}