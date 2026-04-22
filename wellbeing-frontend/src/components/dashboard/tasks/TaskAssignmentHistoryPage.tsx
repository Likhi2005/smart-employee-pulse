import { useEffect, useMemo, useState } from 'react'
import { Clock3, Filter, Loader2, RefreshCw, Search } from 'lucide-react'
import { getEmployeesForAssignment, getTaskHistoryFeed } from '@/services/taskService'

type HistoryAction =
    | ''
    | 'created'
    | 'assigned'
    | 'reassigned'
    | 'accepted'
    | 'rejected'
    | 'completed'
    | 'updated'
    | 'deleted'

interface FeedHistoryItem {
    _id: string
    action: string
    notes?: string
    createdAt: string
    meta?: Record<string, any>
    taskId?: { _id?: string; title?: string; status?: string; priority?: string } | string
    actorId?: { _id?: string; fullName?: string; email?: string; role?: string }
}

function actionPill(action: string) {
    if (action === 'completed') return 'bg-emerald-500/15 text-emerald-300'
    if (action === 'rejected' || action === 'deleted') return 'bg-red-500/15 text-red-300'
    if (action === 'assigned' || action === 'reassigned') return 'bg-amber-500/15 text-amber-300'
    return 'bg-neutral-800 text-neutral-300'
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function taskTitle(row: FeedHistoryItem) {
    if (row.taskId && typeof row.taskId === 'object') return row.taskId.title || 'Unknown task'
    return 'Unknown task'
}

function taskIdText(row: FeedHistoryItem) {
    if (row.taskId && typeof row.taskId === 'object') return row.taskId._id || '-'
    if (typeof row.taskId === 'string') return row.taskId
    return '-'
}

export function TaskAssignmentHistoryPage() {
    const [history, setHistory] = useState<FeedHistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [employees, setEmployees] = useState<Array<{ _id: string; fullName: string }>>([])

    const [action, setAction] = useState<HistoryAction>('')
    const [actorId, setActorId] = useState('')
    const [taskId, setTaskId] = useState('')

    const [page, setPage] = useState(1)
    const [limit] = useState(20)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)

    const loadHistory = async (nextPage = page) => {
        setLoading(true)
        setError('')
        try {
            const response = await getTaskHistoryFeed({
                page: nextPage,
                limit,
                action: action || undefined,
                actorId: actorId || undefined,
                taskId: taskId.trim() || undefined,
            })
            setHistory((response.history || []) as FeedHistoryItem[])
            setTotalPages(response.meta?.totalPages || 1)
            setTotalItems(response.meta?.total || 0)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load assignment history')
            setHistory([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const run = async () => {
            try {
                const rows = await getEmployeesForAssignment()
                setEmployees(rows.map((r) => ({ _id: r._id, fullName: r.fullName })))
            } catch {
                setEmployees([])
            }
        }
        run()
    }, [])

    useEffect(() => {
        setPage(1)
        loadHistory(1)
    }, [action, actorId, taskId])

    useEffect(() => {
        loadHistory(page)
    }, [page])

    const actionCounts = useMemo(() => {
        const map: Record<string, number> = {}
        history.forEach((h) => {
            map[h.action] = (map[h.action] || 0) + 1
        })
        return map
    }, [history])

    return (
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="border-b border-neutral-800 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Task Studio</p>
                        <h2 className="text-2xl font-bold tracking-tight text-neutral-50">Assignment History</h2>
                        <p className="mt-1 text-sm text-neutral-400">
                            Operational event feed for assignment lifecycle and audit.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => loadHistory(page)}
                        className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-4">
                    <select
                        value={action}
                        onChange={(e) => setAction(e.target.value as HistoryAction)}
                        className="h-11 rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                    >
                        <option value="">All actions</option>
                        <option value="created">Created</option>
                        <option value="assigned">Assigned</option>
                        <option value="reassigned">Reassigned</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                        <option value="updated">Updated</option>
                        <option value="deleted">Deleted</option>
                    </select>

                    <select
                        value={actorId}
                        onChange={(e) => setActorId(e.target.value)}
                        className="h-11 rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                    >
                        <option value="">All actors</option>
                        {employees.map((emp) => (
                            <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                        ))}
                    </select>

                    <label className="relative md:col-span-2">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                            value={taskId}
                            onChange={(e) => setTaskId(e.target.value)}
                            placeholder="Filter by task id"
                            className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900 pl-9 pr-3 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                        />
                    </label>
                </div>

                {error && (
                    <div className="mt-3 rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2 text-sm text-red-300">
                        {error}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="min-w-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/30">
                    {loading ? (
                        <div className="flex items-center gap-2 p-4 text-sm text-neutral-400">
                            <Loader2 size={16} className="animate-spin" />
                            Loading history feed...
                        </div>
                    ) : history.length === 0 ? (
                        <div className="p-6 text-center text-sm text-neutral-400">No history records for current filters.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-[760px] w-full text-left text-sm">
                                <thead className="border-b border-neutral-800 bg-neutral-950/60 text-xs uppercase tracking-[0.08em] text-neutral-500">
                                    <tr>
                                        <th className="px-3 py-2.5">Action</th>
                                        <th className="px-3 py-2.5">Task</th>
                                        <th className="px-3 py-2.5">Actor</th>
                                        <th className="px-3 py-2.5">When</th>
                                        <th className="px-3 py-2.5">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((row) => (
                                        <tr key={row._id} className="border-b border-neutral-800/80">
                                            <td className="px-3 py-3">
                                                <span className={['rounded-full px-2 py-1 text-xs', actionPill(row.action)].join(' ')}>
                                                    {row.action}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="font-medium text-neutral-100">{taskTitle(row)}</p>
                                                <p className="text-xs text-neutral-500">{taskIdText(row)}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="text-neutral-200">{row.actorId?.fullName || '-'}</p>
                                                <p className="text-xs text-neutral-500">{row.actorId?.role || '-'}</p>
                                            </td>
                                            <td className="px-3 py-3 text-neutral-300">{formatDateTime(row.createdAt)}</td>
                                            <td className="px-3 py-3 text-neutral-300">{row.notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t border-neutral-800 px-3 py-2 text-sm">
                        <p className="text-neutral-400">Total events: <span className="text-neutral-200">{totalItems}</span></p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="text-neutral-400">Page {page} / {Math.max(1, totalPages)}</span>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                <aside className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                    <h3 className="text-sm font-semibold text-neutral-100">Feed Snapshot</h3>
                    <div className="mt-3 space-y-2 text-sm">
                        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                            <p className="text-neutral-500">Visible rows</p>
                            <p className="text-neutral-100">{history.length}</p>
                        </div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                            <p className="text-neutral-500">Actions in page</p>
                            <div className="mt-1 space-y-1 text-neutral-200">
                                {Object.keys(actionCounts).length === 0 && <p>-</p>}
                                {Object.entries(actionCounts).map(([k, v]) => (
                                    <p key={k}>{k}: {v}</p>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-neutral-300">
                            <p className="mb-1 inline-flex items-center gap-1 text-neutral-500">
                                <Clock3 size={13} />
                                Event ordering
                            </p>
                            <p>Newest first, server-sorted for audit consistency.</p>
                        </div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-neutral-300">
                            <p className="mb-1 inline-flex items-center gap-1 text-neutral-500">
                                <Filter size={13} />
                                Current filter
                            </p>
                            <p>Action: {action || 'All'}</p>
                            <p>Actor: {actorId ? 'Selected' : 'All'}</p>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    )
}