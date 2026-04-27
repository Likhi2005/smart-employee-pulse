import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Mail, Briefcase, Activity, CalendarDays, ShieldCheck, Zap } from 'lucide-react'
import api from '@/services/api'

interface EmployeeDetailsDrawerProps {
    employeeId: string | null
    onClose: () => void
}

interface EmployeeDetails {
    _id: string
    fullName: string
    email: string
    department?: string
    skills?: string[]
    currentWorkload?: number
    role?: string
    isActive?: boolean
    isPasswordChanged?: boolean
    createdAt?: string
    updatedAt?: string
}

export const EmployeeDetailsDrawer: React.FC<EmployeeDetailsDrawerProps> = ({
    employeeId,
    onClose,
}) => {
    const [employee, setEmployee] = useState < EmployeeDetails | null > (null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadEmployee = async () => {
            if (!employeeId) return

            setLoading(true)
            setError('')

            try {
                const response = await api.get('/employees/' + employeeId)
                setEmployee(response.data?.data || null)
            } catch (err: any) {
                setError(err?.response?.data?.message || 'Failed to load employee details')
            } finally {
                setLoading(false)
            }
        }

        if (employeeId) {
            loadEmployee()
        } else {
            setEmployee(null)
            setError('')
        }
    }, [employeeId])

    return (
        <AnimatePresence>
            {employeeId && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.aside
                        initial={{ x: 420, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 420, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-neutral-800 bg-neutral-950 shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-50">Employee Details</h3>
                                <p className="text-xs text-neutral-400">View employee information</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5">
                            {loading && (
                                <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-5 text-sm text-neutral-400">
                                    Loading details...
                                </div>
                            )}

                            {error && !loading && (
                                <div className="rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-5 text-sm text-red-300">
                                    {error}
                                </div>
                            )}

                            {employee && !loading && (
                                <div className="space-y-5">
                                    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                                        <h4 className="text-xl font-bold text-neutral-50">{employee.fullName}</h4>
                                        <p className="mt-1 text-sm text-neutral-400">{employee.department || 'Not specified'}</p>

                                        <div className="mt-4 flex items-center gap-2">
                                            <span
                                                className={
                                                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ' +
                                                    (employee.isActive
                                                        ? 'bg-green-500/10 text-green-400'
                                                        : 'bg-red-500/10 text-red-400')
                                                }
                                            >
                                                <span
                                                    className={
                                                        'h-1.5 w-1.5 rounded-full ' +
                                                        (employee.isActive ? 'bg-green-400' : 'bg-red-400')
                                                    }
                                                />
                                                {employee.isActive ? 'Active' : 'Inactive'}
                                            </span>

                                            <span
                                                className={
                                                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ' +
                                                    (employee.isPasswordChanged
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-amber-500/10 text-amber-400')
                                                }
                                            >
                                                <ShieldCheck size={12} />
                                                {employee.isPasswordChanged ? 'Password changed' : 'Password pending'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <InfoRow icon={Mail} label="Email" value={employee.email} />
                                        <InfoRow icon={Briefcase} label="Role" value={employee.role || 'employee'} />
                                        <InfoRow
                                            icon={Activity}
                                            label="Workload"
                                            value={String(employee.currentWorkload ?? 0)}
                                        />
                                        
                                        {employee.skills && employee.skills.length > 0 && (
                                            <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 rounded-md bg-neutral-800 p-2 text-neutral-300">
                                                        <Zap size={15} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs uppercase tracking-wide text-neutral-500">Skills</p>
                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {employee.skills.map((skill, idx) => (
                                                                <span key={idx} className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 border border-amber-500/20">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <InfoRow
                                            icon={CalendarDays}
                                            label="Created"
                                            value={employee.createdAt ? new Date(employee.createdAt).toLocaleString() : 'N/A'}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}

const InfoRow = ({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>
    label: string
    value: string
}) => {
    return (
        <div className="flex items-start gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3">
            <div className="mt-0.5 rounded-md bg-neutral-800 p-2 text-neutral-300">
                <Icon size={15} />
            </div>
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
                <p className="truncate text-sm text-neutral-100">{value}</p>
            </div>
        </div>
    )
}