import { CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react'
import type { TaskState } from '@/types'

interface TaskStateIndicatorProps {
    state: TaskState
    showHistory?: boolean
    stateHistory?: Array<{ state: TaskState; changedAt: string; reason?: string }>
}

const stateConfig: Record<TaskState, { label: string; color: string; icon: React.ReactNode; description: string }> = {
    DRAFT: {
        label: 'Draft',
        color: 'text-neutral-400 bg-neutral-900/50 border-neutral-700',
        icon: <Clock size={14} />,
        description: 'Initial form, not yet validated',
    },
    VALIDATED: {
        label: 'Validated',
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        icon: <CheckCircle2 size={14} />,
        description: 'Form rules passed, ready to enrich',
    },
    ENRICHED: {
        label: 'Enriched',
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        icon: <Zap size={14} />,
        description: 'Skills and tags added, context complete',
    },
    POLICY_VALIDATED: {
        label: 'Policy Validated',
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
        icon: <CheckCircle2 size={14} />,
        description: 'SLA and workload policies checked',
    },
    ASSIGNABLE: {
        label: 'Ready to Assign',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        icon: <AlertCircle size={14} />,
        description: 'Candidates ready to be ranked',
    },
    ASSIGNED: {
        label: 'Assigned',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        icon: <CheckCircle2 size={14} />,
        description: 'Task assigned to employee',
    },
    REVIEW_PENDING: {
        label: 'Review Pending',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        icon: <Clock size={14} />,
        description: 'Awaiting manager approval',
    },
    APPROVED: {
        label: 'Approved',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        icon: <CheckCircle2 size={14} />,
        description: 'Approved, employee notified',
    },
    REJECTED: {
        label: 'Rejected',
        color: 'text-red-400 bg-red-500/10 border-red-500/30',
        icon: <AlertCircle size={14} />,
        description: 'Assignment rejected by manager',
    },
}

export function TaskStateIndicator({ state, showHistory, stateHistory }: TaskStateIndicatorProps) {
    const config = stateConfig[state]

    return (
        <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${config.color}`}>
                {config.icon}
                <span className="text-sm font-medium">{config.label}</span>
            </div>
            <p className="text-xs text-neutral-400">{config.description}</p>

            {showHistory && stateHistory && stateHistory.length > 0 && (
                <div className="mt-3 space-y-1.5 rounded-lg border border-neutral-800 bg-neutral-900/30 p-2">
                    <p className="text-xs font-semibold text-neutral-300">State History</p>
                    {stateHistory.map((entry, idx) => (
                        <div key={idx} className="text-xs text-neutral-400">
                            <span className="font-medium text-neutral-300">{entry.state}</span>
                            {' → '}
                            {new Date(entry.changedAt).toLocaleDateString()}
                            {entry.reason && <span className="ml-1 text-neutral-500">({entry.reason})</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}