import { CheckSquare, GripVertical, Layers3 } from 'lucide-react'

interface SavedViewOption {
    key: string
    label: string
}

interface TaskListHeaderProps {
    denseMode: boolean
    onToggleDense: () => void
    onCreateTask?: () => void
    selectedCount?: number
    savedViews?: SavedViewOption[]
    activeSavedView?: string
    onSelectSavedView?: (key: string) => void
}

export function TaskListHeader({
    denseMode,
    onToggleDense,
    onCreateTask,
    selectedCount = 0,
    savedViews = [],
    activeSavedView = '',
    onSelectSavedView,
}: TaskListHeaderProps) {
    return (
        <div className="border-b border-neutral-800 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-neutral-500">Projects / Q4 Launch / Task Operations</p>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-50">All Tasks List</h1>
                    <p className="text-xs text-neutral-500">
                        {selectedCount > 0 ? `${selectedCount} selected` : 'No rows selected'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {savedViews.length > 0 && (
                        <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-2">
                            <Layers3 size={14} className="text-neutral-400" />
                            <select
                                value={activeSavedView}
                                onChange={(e) => onSelectSavedView?.(e.target.value)}
                                className="bg-transparent text-sm text-neutral-200 outline-none"
                            >
                                {savedViews.map((v) => (
                                    <option key={v.key} value={v.key} className="bg-neutral-950">
                                        {v.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="button"
                        className={[
                            'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                            denseMode
                                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800',
                        ].join(' ')}
                        onClick={onToggleDense}
                    >
                        <GripVertical size={15} />
                        {denseMode ? 'Compact' : 'Comfortable'}
                    </button>

                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                    >
                        <CheckSquare size={16} />
                        Bulk Actions
                    </button>

                    <button
                        type="button"
                        onClick={onCreateTask}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-400"
                    >
                        + Create Task
                    </button>
                </div>
            </div>
        </div>
    )
}