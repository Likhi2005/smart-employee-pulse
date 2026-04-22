import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { CandidateRanking, RejectedCandidate } from '@/types'

interface ExplainabilityPanelProps {
    topCandidate: CandidateRanking
    rejectedCandidates?: RejectedCandidate[]
    policyApplied?: string
    allCandidates?: CandidateRanking[]
}

export function ExplainabilityPanel({
    topCandidate,
    rejectedCandidates,
    policyApplied = 'manual',
    allCandidates = [],
}: ExplainabilityPanelProps) {
    return (
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-100">Why This Candidate?</h3>
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs text-amber-300">
                    <Sparkles size={12} />
                    {topCandidate.confidence >= 0.85 ? 'High Confidence' : 'Medium Confidence'}
                </div>
            </div>

            {/* Top Candidate */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="font-semibold text-neutral-100">{topCandidate.fullName}</p>
                        <p className="text-xs text-neutral-400">{topCandidate.email}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-amber-400">{topCandidate.score}</div>
                        <div className="text-xs text-amber-300">Rank Score</div>
                    </div>
                </div>
            </div>

            {/* Reasons */}
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <p className="text-sm font-semibold text-neutral-200">Why ranked first:</p>
                </div>
                <ul className="space-y-1.5 pl-6">
                    {topCandidate.reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-neutral-300">
                            <span className="text-emerald-400">✓</span> {reason}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Risk Factors */}
            {topCandidate.riskFactors.length > 0 && (
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-400" />
                        <p className="text-sm font-semibold text-neutral-200">Risk factors:</p>
                    </div>
                    <ul className="space-y-1.5 pl-6">
                        {topCandidate.riskFactors.map((risk, idx) => (
                            <li key={idx} className="text-sm text-neutral-400">
                                <span className="text-amber-400">⚠️</span> {risk}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Policy Applied */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-2">
                <p className="text-xs text-neutral-400">
                    Policy applied: <span className="font-semibold text-neutral-300">{policyApplied}</span>
                </p>
            </div>

            {/* Other Candidates Summary */}
            {rejectedCandidates && rejectedCandidates.length > 0 && (
                <div>
                    <p className="mb-2 text-sm font-semibold text-neutral-300">
                        Why not others ({rejectedCandidates.length})?
                    </p>
                    <div className="max-h-40 space-y-1.5 overflow-y-auto pr-2">
                        {rejectedCandidates.slice(0, 3).map((rejected, idx) => {
                            const candidate = allCandidates.find((c) => c.employeeId === rejected.employeeId)
                            return (
                                <div key={idx} className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-2 text-xs">
                                    <p className="font-medium text-neutral-300">
                                        {candidate?.fullName} (Score: {rejected.score})
                                    </p>
                                    <p className="mt-1 text-neutral-400">{rejected.rejectionReasons[0] || 'Lower score'}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}