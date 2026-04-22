import { ArrowDownUp, CalendarDays, Filter, Search } from 'lucide-react'
import type { TaskListFilters } from '@/types'
import type { EmployeeOption } from '@/services/taskService'

interface TaskFiltersBarProps {
    value: TaskListFilters
    onChange: (next: TaskListFilters) => void
    onApply: () => void
    onReset: () => void
    assigneeOptions?: EmployeeOption[]
}

export function TaskFiltersBar({
    value,
    onChange,
    onApply,
    onReset,
    assigneeOptions = [],
}: TaskFiltersBarProps) {
    const update = <K extends keyof TaskListFilters>(key: K, fieldValue: TaskListFilters[K]) => {
        onChange({ ...value, [key]: fieldValue })
    }

    return (
        <div className="border-b border-neutral-800 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-lg">
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    />
                    <input
                        value={value.search}
                        onChange={(e) => update('search', e.target.value)}
                        placeholder="Search by title, description, task id..."
                        className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-900 pl-10 pr-4 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/40"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onApply}
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300 hover:bg-amber-500/15"
                    >
                        <Filter size={15} />
                        Apply
                    </button>

                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <select
                    value={value.status}
                    onChange={(e) => update('status', e.target.value)}
                    className="h-10 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 outline-none focus:border-amber-500/70"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                </select>

                <select
                    value={value.priority}
                    onChange={(e) => update('priority', e.target.value)}
                    className="h-10 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 outline-none focus:border-amber-500/70"
                >
                    <option value="">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                <select
                    value={value.riskLevel}
                    onChange={(e) => update('riskLevel', e.target.value)}
                    className="h-10 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 outline-none focus:border-amber-500/70"
                >
                    <option value="">All Risk</option>
                    <option value="high">High Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk</option>
                </select>

                <select
                    value={value.assignee}
                    onChange={(e) => update('assignee', e.target.value)}
                    className="h-10 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 outline-none focus:border-amber-500/70"
                >
                    <option value="">All Assignees</option>
                    {assigneeOptions.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                            {emp.fullName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3">
                    <CalendarDays size={14} className="text-neutral-500" />
                    <input
                        type="date"
                        value={value.dueDateFrom}
                        onChange={(e) => update('dueDateFrom', e.target.value)}
                        className="h-10 w-full bg-transparent text-sm text-neutral-200 outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3">
                    <CalendarDays size={14} className="text-neutral-500" />
                    <input
                        type="date"
                        value={value.dueDateTo}
                        onChange={(e) => update('dueDateTo', e.target.value)}
                        className="h-10 w-full bg-transparent text-sm text-neutral-200 outline-none"
                    />
                </div>

                <select
                    value={value.sortBy}
                    onChange={(e) => update('sortBy', e.target.value as TaskListFilters['sortBy'])}
                    className="h-10 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 outline-none focus:border-amber-500/70"
                >
                    <option value="createdAt">Sort: Created</option>
                    <option value="updatedAt">Sort: Updated</option>
                    <option value="dueDate">Sort: Due Date</option>
                    <option value="priority">Sort: Priority</option>
                    <option value="effort">Sort: Effort</option>
                    <option value="riskLevel">Sort: Risk</option>
                    <option value="status">Sort: Status</option>
                    <option value="id">Sort: Task ID</option>
                </select>

                <button
                    type="button"
                    onClick={() => update('sortDir', value.sortDir === 'asc' ? 'desc' : 'asc')}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 hover:bg-neutral-800"
                >
                    <ArrowDownUp size={14} />
                    {value.sortDir.toUpperCase()}
                </button>
            </div>
        </div>
    )
}