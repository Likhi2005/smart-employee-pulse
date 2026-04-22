import { CheckCircle2, Circle, Save, Settings2, Sparkles } from 'lucide-react'

export type CreateStep = 1 | 2 | 3 | 4

interface TaskCreateHeaderProps {
    step: CreateStep
    onStepChange: (step: CreateStep) => void
    onNewRequest: () => void
    onSettings?: () => void
    isSavingDraft?: boolean
    maxUnlockedStep?: CreateStep
}

const STEPS: Array<{ id: CreateStep; label: string }> = [
    { id: 1, label: 'Draft' },
    { id: 2, label: 'Enrich' },
    { id: 3, label: 'Assign' },
    { id: 4, label: 'Review' },
]

export function TaskCreateHeader({
    step,
    onStepChange,
    onNewRequest,
    onSettings,
    isSavingDraft = false,
    maxUnlockedStep = 1,
}: TaskCreateHeaderProps) {
    return (
        <div className="border-b border-neutral-800 bg-neutral-950/70 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Task Studio</p>
                    <h2 className="text-2xl font-bold tracking-tight text-neutral-50">Create + Assign Task</h2>
                    <p className="text-sm text-neutral-400">Structured authoring, ranked assignment, and risk review.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300">
                        <Save size={14} />
                        {isSavingDraft ? 'Saving draft...' : 'Draft auto-save ready'}
                    </div>
                    <button
                        type="button"
                        onClick={onSettings}
                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                    >
                        <span className="inline-flex items-center gap-2">
                            <Settings2 size={14} />
                            Settings
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={onNewRequest}
                        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-400"
                    >
                        New Request
                    </button>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                {STEPS.map((item) => {
                    const isDone = item.id < step
                    const isActive = item.id === step
                    const isLocked = item.id > maxUnlockedStep
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => !isLocked && onStepChange(item.id)}
                            disabled={isLocked}
                            className={[
                                'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                                isActive
                                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                                    : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800',
                                isLocked ? 'cursor-not-allowed opacity-50' : '',
                            ].join(' ')}
                        >
                            <div className="flex items-center justify-between">
                                <span>{item.label}</span>
                                {isDone ? (
                                    <CheckCircle2 size={15} className="text-emerald-400" />
                                ) : isActive ? (
                                    <Sparkles size={15} className="text-amber-300" />
                                ) : (
                                    <Circle size={15} className="text-neutral-500" />
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}