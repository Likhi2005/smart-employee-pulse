import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TaskCreateHeader, type CreateStep } from './TaskCreateHeader'
import { TaskCreateFormPanel, type DraftFormValues, type EnrichFormValues } from './TaskCreateFormPanel'
import { TaskAssignPanel, type EmployeeCandidate } from './TaskAssignPanel'
import { TaskStateIndicator } from './TaskStateIndicator'
import { Sparkles, User } from 'lucide-react'
import {
    assignTask,
    createTask,
    createTaskFromTemplate,
    getEmployeesForAssignment,
    rankTaskCandidates,
    validateTaskPolicy,
} from '@/services/taskService'
import { getTemplate } from '@/services/templateService'
import type { CandidateRanking, PolicyValidationResult, TaskState, TaskTemplateItem } from '@/types'

const INITIAL_DRAFT: DraftFormValues = {
    title: '',
    description: '',
    effort: '4',
    priority: 'medium',
    dueDate: '',
    mandatory: false,
}

const INITIAL_ENRICH: EnrichFormValues = {
    department: '',
    skills: '',
    tags: '',
    acceptanceCriteria: '',
    dependencyRefs: '',
}

function parseSkills(input: string): string[] {
    return input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
}

function mapCandidateToEmployee(c: CandidateRanking): EmployeeCandidate {
    return {
        id: c.employeeId,
        employeeId: c.employeeId,
        fullName: c.fullName,
        email: c.email,
        department: c.department,
        currentWorkload: Number(c.currentWorkload || 0),
        score: c.score,
        confidence: c.confidence,
        reasons: c.reasons || [],
        riskFactors: c.riskFactors || [],
    }
}

export function TaskCreatePage() {
    const [searchParams] = useSearchParams()
    const templateId = searchParams.get('templateId')

    const [step, setStep] = useState<CreateStep>(1)
    const [maxUnlockedStep, setMaxUnlockedStep] = useState<CreateStep>(1)
    const [taskState, setTaskState] = useState<TaskState>('DRAFT')

    const [draft, setDraft] = useState<DraftFormValues>(INITIAL_DRAFT)
    const [enrich, setEnrich] = useState<EnrichFormValues>(INITIAL_ENRICH)

    const [isSavingDraft, setIsSavingDraft] = useState(false)
    const [isCreatingTask, setIsCreatingTask] = useState(false)
    const [isSmartAssigning, setIsSmartAssigning] = useState(false)
    const [isAssigning, setIsAssigning] = useState(false)

    const [createdTaskId, setCreatedTaskId] = useState<string | null>(null)
    const [templateHydrated, setTemplateHydrated] = useState(false)

    const [baseEmployees, setBaseEmployees] = useState<EmployeeCandidate[]>([])
    const [rankedCandidates, setRankedCandidates] = useState<CandidateRanking[]>([])
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

    const [policyResult, setPolicyResult] = useState<PolicyValidationResult | null>(null)
    const [policyLoading, setPolicyLoading] = useState(false)
    const [rankingLoading, setRankingLoading] = useState(false)
    const [rankingState, setRankingState] = useState<{ source?: string; rankedAt?: string; signalFreshness?: string } | null>(null)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const employeesForAssign = useMemo(() => {
        if (rankedCandidates.length > 0) {
            return rankedCandidates.map(mapCandidateToEmployee)
        }
        return baseEmployees
    }, [rankedCandidates, baseEmployees])

    const selectedEmployee = useMemo(
        () => employeesForAssign.find((e) => e.id === selectedEmployeeId) || null,
        [employeesForAssign, selectedEmployeeId]
    )

    useEffect(() => {
        let mounted = true
        const run = async () => {
            try {
                const rows = await getEmployeesForAssignment()
                if (!mounted) return
                const mapped: EmployeeCandidate[] = rows.map((r) => ({
                    id: r._id,
                    employeeId: r._id,
                    fullName: r.fullName,
                    email: r.email,
                    department: r.department,
                    currentWorkload: r.currentWorkload,
                    score: Math.max(20, 100 - Math.min(95, Number(r.currentWorkload || 0))),
                    confidence: 0.5,
                    reasons: ['Candidate loaded from team availability snapshot'],
                    riskFactors: Number(r.currentWorkload || 0) >= 80 ? ['High workload threshold reached'] : [],
                }))
                setBaseEmployees(mapped.sort((a, b) => b.score - a.score))
            } catch {
                setBaseEmployees([])
            }
        }
        run()
        return () => {
            mounted = false
        }
    }, [])

    useEffect(() => {
        let active = true
        const hydrate = async () => {
            if (!templateId || templateHydrated) return
            try {
                const tpl = (await getTemplate(templateId)) as TaskTemplateItem
                if (!active || !tpl) return

                setDraft((prev) => ({
                    ...prev,
                    title: tpl.title || prev.title,
                    description: tpl.description || prev.description,
                    effort: String(tpl.defaultEffort || prev.effort),
                    priority: tpl.defaultPriority || prev.priority,
                    mandatory: Boolean(tpl.defaultIsMandatory),
                }))

                setEnrich((prev) => ({
                    ...prev,
                    department: tpl.department || prev.department,
                    skills: (tpl.skillsRequired || []).join(', '),
                    tags: (tpl.tags || []).join(', '),
                }))

                setSuccess('Template applied. You can adjust fields before assignment.')
            } catch {
                setError('Unable to load selected template.')
            } finally {
                setTemplateHydrated(true)
            }
        }

        hydrate()
        return () => {
            active = false
        }
    }, [templateId, templateHydrated])

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSavingDraft(true)
            localStorage.setItem(
                'taskStudioDraft',
                JSON.stringify({ draft, enrich, taskState, savedAt: Date.now() })
            )
            setTimeout(() => setIsSavingDraft(false), 300)
        }, 700)

        return () => clearTimeout(timer)
    }, [draft, enrich, taskState])

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!draft.title.trim() || Number(draft.effort) < 1) return

            setPolicyLoading(true)
            try {
                const policy = await validateTaskPolicy({
                    title: draft.title,
                    description: draft.description,
                    effort: Number(draft.effort),
                    priority: draft.priority,
                    dueDate: draft.dueDate || undefined,
                    isMandatory: draft.mandatory,
                })
                setPolicyResult(policy)
                if (policy.status === 'block') {
                    setTaskState('VALIDATED')
                } else if (policy.status === 'warn') {
                    setTaskState('POLICY_VALIDATED')
                } else {
                    setTaskState('ASSIGNABLE')
                }
            } catch {
                setPolicyResult(null)
            } finally {
                setPolicyLoading(false)
            }

            setRankingLoading(true)
            try {
                const ranked = await rankTaskCandidates({
                    taskId: createdTaskId || undefined,
                    effort: Number(draft.effort),
                    dueDate: draft.dueDate || undefined,
                    isMandatory: draft.mandatory,
                    requiredSkills: parseSkills(enrich.skills),
                })
                setRankedCandidates(ranked.rankedCandidates || [])
                setRankingState(ranked.rankingState || null)

                if (!selectedEmployeeId && ranked.topCandidate?.employeeId) {
                    setSelectedEmployeeId(ranked.topCandidate.employeeId)
                }
            } catch {
                setRankedCandidates([])
                setRankingState(null)
            } finally {
                setRankingLoading(false)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [draft, enrich.skills, createdTaskId, selectedEmployeeId])

    const resetAll = () => {
        setStep(1)
        setMaxUnlockedStep(1)
        setTaskState('DRAFT')
        setDraft(INITIAL_DRAFT)
        setEnrich(INITIAL_ENRICH)
        setCreatedTaskId(null)
        setSelectedEmployeeId(null)
        setPolicyResult(null)
        setRankedCandidates([])
        setRankingState(null)
        setError('')
        setSuccess('')
    }

    const safeSetStep = (next: CreateStep) => {
        if (next <= maxUnlockedStep) {
            setStep(next)
        }
    }

    const createTaskIfNeeded = async (): Promise<string | null> => {
        if (createdTaskId) return createdTaskId
        setIsCreatingTask(true)
        setError('')

        try {
            let id: string | null = null

            if (templateId) {
                const response = await createTaskFromTemplate({
                    templateId,
                    title: draft.title,
                    description: draft.description,
                    effort: Number(draft.effort),
                    priority: draft.priority,
                    dueDate: draft.dueDate || undefined,
                    isMandatory: draft.mandatory,
                })
                const task = response?.task
                id = task?.id || task?._id || null
            } else {
                const task = await createTask({
                    title: draft.title,
                    description: draft.description,
                    effort: Number(draft.effort),
                    priority: draft.priority,
                    dueDate: draft.dueDate || undefined,
                    isMandatory: draft.mandatory,
                })
                id = task?.id || task?._id || null
            }

            if (!id) {
                setError('Task created but no identifier returned.')
                return null
            }

            setCreatedTaskId(id)
            setTaskState('ENRICHED')
            setSuccess('Task created successfully. Continue to assignment.')
            return id
        } catch (err: any) {
            setTaskState('DRAFT')
            setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to create task.')
            return null
        } finally {
            setIsCreatingTask(false)
        }
    }

    const handleContinueFromDraft = () => {
        setError('')
        setSuccess('')
        setTaskState('VALIDATED')
        setMaxUnlockedStep(2)
        setStep(2)
    }

    const handleContinueFromEnrich = async () => {
        if (policyResult?.status === 'block') {
            setError('Fix policy blockers before continuing.')
            return
        }
        const id = await createTaskIfNeeded()
        if (!id) return
        setTaskState('POLICY_VALIDATED')
        setMaxUnlockedStep(3)
        setStep(3)
    }

    const handleContinueToReview = () => {
        if (!selectedEmployeeId) {
            setError('Please select an assignee first.')
            return
        }
        setError('')
        setMaxUnlockedStep(4)
        setStep(4)
    }

    const handleSmartAssign = async () => {
        setIsSmartAssigning(true)
        setError('')
        try {
            const ranked = await rankTaskCandidates({
                taskId: createdTaskId || undefined,
                effort: Number(draft.effort),
                dueDate: draft.dueDate || undefined,
                isMandatory: draft.mandatory,
                requiredSkills: parseSkills(enrich.skills),
            })

            setRankedCandidates(ranked.rankedCandidates || [])
            setRankingState(ranked.rankingState || null)

            if (ranked.topCandidate?.employeeId) {
                setSelectedEmployeeId(ranked.topCandidate.employeeId)
                setSuccess('Top-ranked candidate selected based on live signals.')
            } else {
                setError('No ranking suggestion available right now.')
            }
        } catch (err: any) {
            setError(err?.response?.data?.error || err?.response?.data?.message || 'Candidate ranking failed.')
        } finally {
            setIsSmartAssigning(false)
        }
    }

    const handleFinalAssign = async () => {
        if (!createdTaskId || !selectedEmployeeId) return
        setIsAssigning(true)
        setError('')
        
        try {
            await assignTask({
                taskId: createdTaskId,
                employeeId: selectedEmployeeId,
                assignmentMode: 'manual',
                requiredSkills: parseSkills(enrich.skills),
            })
            setTaskState('ASSIGNED')
            setSuccess('Task assigned successfully.')
        } catch (err: any) {
            setTaskState('ASSIGNABLE')
            setError(err?.response?.data?.error || err?.response?.data?.message || 'Assignment failed.')
        } finally {
            setIsAssigning(false)
        }
    }



    return (
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950">
            <TaskCreateHeader
                step={step}
                onStepChange={safeSetStep}
                maxUnlockedStep={maxUnlockedStep}
                onNewRequest={resetAll}
                isSavingDraft={isSavingDraft}
                onSettings={() => setSuccess('Settings panel can be connected next.')}
            />

            {(error || success) && (
                <div className="px-4 pt-4 sm:px-5">
                    {error && (
                        <div className="rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2 text-sm text-red-300">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mt-2 rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-sm text-emerald-300">
                            {success}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 gap-2 border-t border-neutral-800 px-4 py-3 sm:grid-cols-4 sm:px-5">
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-300">
                    Saved: <span className="text-neutral-100">{isSavingDraft ? 'syncing' : 'saved'}</span>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-300">
                    Policy: <span className="text-neutral-100">{policyLoading ? 'checking' : policyResult?.status || 'idle'}</span>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-300">
                    Ranking: <span className="text-neutral-100">{rankingLoading ? 'refreshing' : `${employeesForAssign.length} candidates`}</span>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-300">
                    Signals: <span className="text-neutral-100">{rankingState?.signalFreshness || 'unknown'}</span>
                </div>
            </div>

            <div className="border-t border-neutral-800 px-4 py-4 sm:px-5">
                <TaskStateIndicator state={taskState} />
                {/* existing policy results */}
                {!!policyResult?.blockers?.length && (
                    <div className="mt-3 rounded-lg border border-red-900/40 bg-red-950/20 p-3">
                        <p className="text-sm font-semibold text-red-300">Policy blockers</p>
                        <ul className="mt-1 list-disc pl-5 text-xs text-red-200">
                            {policyResult.blockers.map((b, idx) => (
                                <li key={idx}>{b}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {!!policyResult?.warnings?.length && (
                    <div className="mt-3 rounded-lg border border-amber-900/40 bg-amber-950/20 p-3">
                        <p className="text-sm font-semibold text-amber-300">Policy warnings</p>
                        <ul className="mt-1 list-disc pl-5 text-xs text-amber-200">
                            {policyResult.warnings.map((w, idx) => (
                                <li key={idx}>{w}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 xl:grid-cols-2">
                {(step === 1 || step === 2) && (
                    <div className="xl:col-span-2 xl:mx-auto xl:w-2/3">
                        <TaskCreateFormPanel
                            step={step}
                            draftValues={draft}
                            enrichValues={enrich}
                            onChangeDraft={setDraft}
                            onChangeEnrich={setEnrich}
                            onContinue={step === 1 ? handleContinueFromDraft : handleContinueFromEnrich}
                            onBack={step === 2 ? () => setStep(1) : undefined}
                            isSubmitting={isCreatingTask}
                        />
                    </div>
                )}

                {step === 3 && (
                    <div className="xl:col-span-2">
                        <TaskAssignPanel
                            employees={employeesForAssign}
                            allCandidates={employeesForAssign}
                            selectedEmployeeId={selectedEmployeeId}
                            onSelectEmployee={setSelectedEmployeeId}
                            onSmartAssign={handleSmartAssign}
                            onContinue={handleContinueToReview}
                            isSmartAssigning={isSmartAssigning}
                            disabled={!createdTaskId}
                            showExplainability
                        />
                    </div>
                )}

                {step === 4 && (
                    <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 xl:col-span-2">
                        <h3 className="text-lg font-semibold text-neutral-100">Review Summary</h3>
                        <p className="mt-1 text-sm text-neutral-400">Final confirmation snapshot for audit and confidence.</p>

                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Task Details Section */}
                            <div className="space-y-4">
                                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                                    <h4 className="mb-4 text-sm font-semibold text-neutral-300 border-b border-neutral-800 pb-2">Core Details</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-neutral-500">Title</p>
                                            <p className="mt-0.5 text-sm font-medium text-neutral-100">{draft.title || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500">Description</p>
                                            <p className="mt-0.5 text-sm text-neutral-300 whitespace-pre-wrap">{draft.description || '-'}</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-neutral-500">Effort</p>
                                                <p className="mt-0.5 text-sm text-neutral-200">{draft.effort} hrs</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-neutral-500">Priority</p>
                                                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    draft.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                    draft.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                    {draft.priority}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-neutral-500">Due Date</p>
                                                <p className="mt-0.5 text-sm text-neutral-200">{draft.dueDate || 'Not set'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enrichment & Assignment Section */}
                            <div className="space-y-4">
                                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                                    <h4 className="mb-4 text-sm font-semibold text-neutral-300 border-b border-neutral-800 pb-2">Enrichment Context</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-neutral-500">Department</p>
                                            <p className="mt-0.5 text-sm text-neutral-200">{enrich.department || 'Any'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500">Skills Required</p>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {parseSkills(enrich.skills).length > 0 ? (
                                                    parseSkills(enrich.skills).map(skill => (
                                                        <span key={skill} className="rounded-md bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">{skill}</span>
                                                    ))
                                                ) : <span className="text-sm text-neutral-500">None</span>}
                                            </div>
                                        </div>
                                    </div>
                                    {(enrich.tags || enrich.dependencyRefs) && (
                                        <div className="mt-3 grid grid-cols-2 gap-4">
                                            {enrich.tags && (
                                                <div>
                                                    <p className="text-xs text-neutral-500">Tags</p>
                                                    <p className="mt-0.5 text-sm text-neutral-200">{enrich.tags}</p>
                                                </div>
                                            )}
                                            {enrich.dependencyRefs && (
                                                <div>
                                                    <p className="text-xs text-neutral-500">Dependencies</p>
                                                    <p className="mt-0.5 text-sm text-neutral-200">{enrich.dependencyRefs}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {enrich.acceptanceCriteria && (
                                        <div className="mt-3">
                                            <p className="text-xs text-neutral-500">Acceptance Criteria</p>
                                            <p className="mt-0.5 text-sm text-neutral-300 whitespace-pre-wrap">{enrich.acceptanceCriteria}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                                    <h4 className="mb-4 text-sm font-semibold text-amber-500/80 border-b border-amber-500/20 pb-2">Selected Assignee</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-lg font-bold text-amber-400">
                                            {selectedEmployee?.fullName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-100">{selectedEmployee?.fullName || 'Unassigned'}</p>
                                            <p className="text-sm text-neutral-400">{selectedEmployee?.email || '-'}</p>
                                        </div>
                                    </div>
                                    {selectedEmployee && (
                                        <div className="mt-3 rounded-lg bg-black/40 p-3">
                                            <p className="text-xs text-amber-500">Why this candidate?</p>
                                            <p className="mt-1 text-xs text-neutral-300">{selectedEmployee.reasons?.[0] || 'Selected from available ranking signals.'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                            {taskState !== 'ASSIGNED' ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                                    >
                                        Back to Assignment
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleFinalAssign}
                                        disabled={isAssigning}
                                        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-400 disabled:opacity-50"
                                    >
                                        {isAssigning ? 'Assigning...' : 'Confirm & Assign Task'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={resetAll}
                                    className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-500 hover:bg-amber-500/20"
                                >
                                    Create Another Task
                                </button>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </section>
    )
}