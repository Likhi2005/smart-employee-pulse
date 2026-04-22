import { CalendarClock, Focus, Gauge, Layers3, Sparkles, AlertTriangle, Activity } from 'lucide-react'

export type EmployeeDashboardSection = 'focus' | 'pipeline' | 'signals' | 'insights'

interface EmployeeDashboardShellProps {
    section: EmployeeDashboardSection
    onSectionChange: (section: EmployeeDashboardSection) => void
}

const SECTIONS: Array<{ id: EmployeeDashboardSection; label: string }> = [
    { id: 'focus', label: 'Focus' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'signals', label: 'Signals' },
    { id: 'insights', label: 'Insights' },
]

function SectionButton({
    active,
    label,
    onClick,
}: {
    active: boolean
    label: string
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'rounded-lg border px-3 py-2 text-sm transition-colors',
                active
                    ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800',
            ].join(' ')}
        >
            {label}
        </button>
    )
}

function DashboardCard({
    title,
    subtitle,
    icon,
    tone = 'default',
}: {
    title: string
    subtitle: string
    icon: React.ReactNode
    tone?: 'default' | 'warn' | 'good'
}) {
    const toneClass =
        tone === 'warn'
            ? 'border-amber-900/50 bg-amber-950/20'
            : tone === 'good'
                ? 'border-emerald-900/50 bg-emerald-950/20'
                : 'border-neutral-800 bg-neutral-900/40'

    return (
        <article className={`rounded-xl border p-4 ${toneClass}`}>
            <div className="mb-2 inline-flex items-center gap-2 text-sm text-neutral-300">
                {icon}
                {title}
            </div>
            <p className="text-sm text-neutral-400">{subtitle}</p>
        </article>
    )
}

export function EmployeeDashboardShell({
    section,
    onSectionChange,
}: EmployeeDashboardShellProps) {
    return (
        <section className="space-y-4">
            <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-950 p-4 sm:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Today</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-100">Employee Dashboard</h2>
                        <p className="mt-1 text-sm text-neutral-400">
                            Start from focus, move work through pipeline, monitor risk signals.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-xs text-neutral-300">
                        <Gauge size={14} className="text-emerald-400" />
                        Capacity: Healthy
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {SECTIONS.map((item) => (
                        <SectionButton
                            key={item.id}
                            active={section === item.id}
                            label={item.label}
                            onClick={() => onSectionChange(item.id)}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    <div className="space-y-4">
                        {section === 'focus' && (
                            <>
                                <DashboardCard
                                    title="Next Best Action"
                                    subtitle="Review TASK-1042 first. Highest deadline pressure with low context-switch cost."
                                    icon={<Sparkles size={14} className="text-cyan-300" />}
                                />
                                <DashboardCard
                                    title="Today Plan"
                                    subtitle="2 deep-work blocks suggested: 10:00-11:30 and 15:00-16:00."
                                    icon={<CalendarClock size={14} className="text-cyan-300" />}
                                />
                            </>
                        )}

                        {section === 'pipeline' && (
                            <>
                                <DashboardCard
                                    title="Pending"
                                    subtitle="5 tasks awaiting acceptance. 2 are mandatory."
                                    icon={<Layers3 size={14} className="text-cyan-300" />}
                                />
                                <DashboardCard
                                    title="In Progress"
                                    subtitle="3 active tasks. 1 task nearing SLA risk in 36h."
                                    icon={<Focus size={14} className="text-cyan-300" />}
                                    tone="warn"
                                />
                            </>
                        )}

                        {section === 'signals' && (
                            <>
                                <DashboardCard
                                    title="Risk Signals"
                                    subtitle="One dependency chain can block today’s delivery if not resolved by noon."
                                    icon={<AlertTriangle size={14} className="text-amber-300" />}
                                    tone="warn"
                                />
                                <DashboardCard
                                    title="Health"
                                    subtitle="Workload balance is healthy. No overtime risk detected."
                                    icon={<Activity size={14} className="text-emerald-300" />}
                                    tone="good"
                                />
                            </>
                        )}

                        {section === 'insights' && (
                            <>
                                <DashboardCard
                                    title="Weekly Throughput"
                                    subtitle="You closed 12 tasks this week. Avg completion latency improved by 14%."
                                    icon={<Activity size={14} className="text-cyan-300" />}
                                    tone="good"
                                />
                                <DashboardCard
                                    title="Skill Utilization"
                                    subtitle="High usage: Incident response, SQL optimization. Suggested growth: API design."
                                    icon={<Sparkles size={14} className="text-cyan-300" />}
                                />
                            </>
                        )}
                    </div>
                </div>

                <aside className="xl:col-span-4">
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
                        <h3 className="text-sm font-semibold text-neutral-100">Command Notes</h3>
                        <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                            <li>Step 1 shell is active and role-routed.</li>
                            <li>Step 2 will connect real /tasks/my-tasks data.</li>
                            <li>Step 3 adds smart prioritization logic.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </section>
    )
}