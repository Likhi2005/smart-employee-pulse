const User = require('../models/User')

function scoreWorkload(currentWorkload) {
    if (currentWorkload < 30) return 40
    if (currentWorkload < 60) return 24
    if (currentWorkload < 80) return 8
    return 0
}

function scoreEffortFit(employeeAvgEffort, taskEffort) {
    if (!employeeAvgEffort || employeeAvgEffort <= 0) return 12
    const ratio = taskEffort / employeeAvgEffort
    if (ratio > 0.85 && ratio < 1.15) return 26
    if (ratio > 0.6 && ratio < 1.5) return 18
    return 8
}

function scoreSLA(dueDate) {
    if (!dueDate) return 10
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days >= 10) return 14
    if (days >= 5) return 8
    if (days >= 2) return 4
    return 0
}

function scoreDomain(employeeSkills = [], requiredSkills = []) {
    if (!requiredSkills.length) return 6
    if (!employeeSkills.length) return 0
    const hit = requiredSkills.filter((s) =>
        employeeSkills.some((es) => String(es).toLowerCase().includes(String(s).toLowerCase()))
    ).length
    const ratio = hit / requiredSkills.length
    if (ratio >= 0.8) return 24
    if (ratio >= 0.5) return 14
    if (ratio > 0) return 6
    return 0
}

function buildRejectionReasons(candidate, top) {
    const reasons = []
    if (candidate.score < top.score) reasons.push('Lower total ranking score than top candidate')
    if (candidate.currentWorkload > top.currentWorkload) reasons.push('Higher current workload')
    if (candidate.confidence < 0.6) reasons.push('Lower confidence due to weaker signal fit')
    if (!reasons.length) reasons.push('Policy tie-break favored top candidate')
    return reasons
}

async function rankCandidates({
    companyId,
    taskInput,
    requiredSkills = [],
    department = null,
}) {
    const query = {
        companyId,
        role: 'employee',
        isActive: true,
    }
    
    // If department is specified (from template), filter employees by department
    if (department) {
        query.department = department
    }
    
    const employees = await User.find(query).select('_id fullName email currentWorkload department skills').lean()

    const taskEffort = Number(taskInput.effort || 1)

    const ranked = employees.map((emp) => {
        const workloadScore = scoreWorkload(Number(emp.currentWorkload || 0))
        const effortScore = scoreEffortFit(4, taskEffort)
        const slaScore = scoreSLA(taskInput.dueDate)
        const domainScore = scoreDomain(emp.skills || [], requiredSkills)

        const totalRaw = workloadScore + effortScore + slaScore + domainScore
        const maxRaw = 40 + 26 + 14 + 24
        const score = Math.round((totalRaw / maxRaw) * 100)
        const confidence = Math.min(0.99, Math.max(0.35, (score + 8) / 100))

        const reasons = []
        if (workloadScore >= 24) reasons.push(`Low workload (${Number(emp.currentWorkload || 0)}%)`)
        else reasons.push(`Manageable workload (${Number(emp.currentWorkload || 0)}%)`)
        if (effortScore >= 18) reasons.push('Effort profile matches expected task size')
        if (slaScore >= 8) reasons.push('SLA window is healthy for this owner')
        if (domainScore >= 14) reasons.push('Strong domain skills match')

        const riskFactors = []
        if (Number(emp.currentWorkload || 0) >= 80) riskFactors.push('High workload threshold reached')
        if (!domainScore && requiredSkills.length) riskFactors.push('Limited skill overlap')

        return {
            employeeId: String(emp._id),
            fullName: emp.fullName,
            email: emp.email,
            department: emp.department,
            currentWorkload: Number(emp.currentWorkload || 0),
            score,
            confidence,
            reasons,
            riskFactors,
        }
    }).sort((a, b) => b.score - a.score)

    const topCandidate = ranked[0] || null
    const rejectedCandidates = topCandidate
        ? ranked.slice(1).map((c) => ({
            employeeId: c.employeeId,
            score: c.score,
            rejectionReasons: buildRejectionReasons(c, topCandidate),
        }))
        : []

    return {
        rankedCandidates: ranked,
        topCandidate,
        rejectedCandidates,
        rankingState: {
            source: 'ranking-service-v2',
            rankedAt: new Date().toISOString(),
            signalFreshness: 'fresh',
        },
    }
}

module.exports = {
    rankCandidates,
}