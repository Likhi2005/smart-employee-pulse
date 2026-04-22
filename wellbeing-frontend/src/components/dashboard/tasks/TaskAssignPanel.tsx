import { Sparkles, Users, AlertCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ExplainabilityPanel } from './ExplainabilityPanel'
import type { CandidateRanking } from '@/types'

export interface EmployeeCandidate extends CandidateRanking {
    id: string
}

interface TaskAssignPanelProps {
    employees: EmployeeCandidate[]
    allCandidates?: EmployeeCandidate[]
    selectedEmployeeId: string | null
    onSelectEmployee: (id: string) => void
    onSmartAssign: () => Promise<void> | void
    onContinue: () => void
    isSmartAssigning?: boolean
    disabled?: boolean
    showExplainability?: boolean
}

function loadColor(workload: number) {
    if (workload >= 80) return 'bg-red-500'
    if (workload >= 60) return 'bg-amber-500'
    return 'bg-emerald-500'
}

export function TaskAssignPanel({
    employees,
    allCandidates = [],
    selectedEmployeeId,
    onSelectEmployee,
    onSmartAssign,
    onContinue,
    isSmartAssigning = false,
    disabled = false,
    showExplainability = true,
}: TaskAssignPanelProps) {
    const [search, setSearch] = useState('')

    const filteredEmployees = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return employees
        return employees.filter((emp) => (emp.fullName + ' ' + emp.email).toLowerCase().includes(q))
    }, [employees, search])

    const selectedEmployee = useMemo(
        () => employees.find((e) => e.id === selectedEmployeeId || e.employeeId === selectedEmployeeId) || null,
        [employees, selectedEmployeeId]
    )

    const topCandidate = filteredEmployees[0] || null

    const rejectedCandidates = useMemo(() => {
        if (!selectedEmployee) return []
        return allCandidates
            .filter((c) => c.id !== selectedEmployee.id)
            .slice(0, 5)
            .map((c) => ({
                employeeId: c.id,
                score: c.score,
                rejectionReasons: c.riskFactors?.length ? c.riskFactors : ['Lower ranking score than selected candidate'],
            }))
    }, [allCandidates, selectedEmployee])

    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-neutral-100">Assignment Console</h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-300">
                            <Users size={12} />
                            {filteredEmployees.length} candidates
                        </span>
                    </div>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none focus:border-amber-500/70"
                    />

                    {topCandidate && (
                        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
                            <div className="mb-1 flex items-center justify-between">
                                <p className="text-sm font-semibold text-neutral-100">
                                    Top Ranked: {topCandidate.fullName}
                                </p>
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1 text-xs text-amber-300">
                                    <Sparkles size={12} />
                                    Score {topCandidate.score}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-300">
                                {topCandidate.reasons?.[0] || 'Selected from ranking engine'}
                            </p>
                        </div>
                    )}

                    {filteredEmployees.length === 0 ? (
                        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 text-sm text-neutral-400">
                            <div className="mb-1 inline-flex items-center gap-1 text-neutral-300">
                                <AlertCircle size={14} />
                                No candidates found
                            </div>
                            Try clearing or adjusting search.
                        </div>
                    ) : (
                        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                            {filteredEmployees.map((employee) => {
                                const isSelected =
                                    selectedEmployeeId === employee.id || selectedEmployeeId === employee.employeeId

                                return (
                                    <button
                                        key={employee.id}
                                        type="button"
                                        onClick={() => onSelectEmployee(employee.id)}
                                        className={[
                                            'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                                            isSelected
                                                ? 'border-amber-500/60 bg-amber-500/10'
                                                : 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800',
                                        ].join(' ')}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-neutral-100">{employee.fullName}</p>
                                                <p className="text-xs text-neutral-500">{employee.email}</p>
                                                <p className="mt-1 text-xs text-neutral-400">
                                                    Score {employee.score} • Confidence {(employee.confidence * 100).toFixed(0)}%
                                                </p>
                                            </div>

                                            <div className="w-24">
                                                <p className="mb-1 text-[11px] text-neutral-400">Load</p>
                                                <div className="h-1.5 w-full rounded bg-neutral-700">
                                                    <div
                                                        className={'h-1.5 rounded ' + loadColor(Number(employee.currentWorkload || 0))}
                                                        style={{ width: Math.min(Number(employee.currentWorkload || 0), 100) + '%' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={onSmartAssign}
                            disabled={disabled || isSmartAssigning}
                            className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
                        >
                            {isSmartAssigning ? 'Refreshing ranking...' : 'Re-rank Candidates'}
                        </button>
                        <button
                            type="button"
                            onClick={onContinue}
                            disabled={disabled || !selectedEmployeeId}
                            className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-100 hover:bg-neutral-800 disabled:opacity-60"
                        >
                            Continue to Review
                        </button>
                    </div>
                </div>
            </section>

            {showExplainability && selectedEmployee && (
                <ExplainabilityPanel
                    topCandidate={selectedEmployee}
                    rejectedCandidates={rejectedCandidates}
                    allCandidates={allCandidates}
                    policyApplied="rule-based"
                />
            )}
        </div>
    )
}