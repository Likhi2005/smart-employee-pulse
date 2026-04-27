import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, AlertCircle } from 'lucide-react'

interface TeamWorkloadItem {
    _id: string
    fullName: string
    currentWorkload: number
    email: string
}

interface EmployeesListProps {
    type: 'overloaded' | 'available'
    teamWorkload: TeamWorkloadItem[]
}

const getWorkloadBadgeColor = (workload: number) => {
    if (workload < 15) {
        return 'bg-green-500/10 text-green-600 border-green-500/20'
    } else if (workload < 25) {
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
    } else if (workload < 35) {
        return 'bg-red-500/10 text-red-600 border-red-500/20'
    }
    return 'bg-red-900/20 text-red-400 border-red-900/40'
}

const getWorkloadLabel = (workload: number) => {
    if (workload < 15) return 'Low'
    if (workload < 25) return 'Medium'
    if (workload < 35) return 'High'
    return 'Critical'
}

export const EmployeesList = memo(function EmployeesList({ type, teamWorkload }: EmployeesListProps) {
    if (!teamWorkload || teamWorkload.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: type === 'overloaded' ? 0.4 : 0.5 }}
                className="rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-black/50 p-6 backdrop-blur-sm"
            >
                <div className="mb-6 flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-neutral-50">{type === 'overloaded' ? 'Overloaded' : 'Available'} Employees</h3>
                </div>
                <div className="text-center py-8 text-neutral-500">No employee data available</div>
            </motion.div>
        )
    }

    const filteredEmployees = useMemo(() => teamWorkload.filter((emp) => {
        if (type === 'overloaded') {
            return emp.currentWorkload >= 35
        }
        return emp.currentWorkload < 15
    }), [teamWorkload, type])

    const title = type === 'overloaded' ? 'Overloaded Employees' : 'Available Employees'
    const icon = type === 'overloaded' ? AlertCircle : Users
    const Icon = icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: type === 'overloaded' ? 0.4 : 0.5 }}
            className="rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-black/50 p-6 backdrop-blur-sm"
        >
            <div className="mb-6 flex items-center gap-2">
                <Icon className="h-5 w-5 text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-50">{title}</h3>
                {filteredEmployees.length > 0 && (
                    <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/20 text-xs font-medium text-blue-400">
                        {filteredEmployees.length}
                    </span>
                )}
            </div>

            <div className="space-y-3">
                {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp, idx) => (
                        <motion.div
                            key={emp._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="flex items-center justify-between rounded-lg border border-neutral-700/50 bg-neutral-800/50 p-4 hover:bg-neutral-800/80 transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-white">
                                        {emp.fullName.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-50">{emp.fullName}</p>
                                    <p className="text-xs text-neutral-400">{emp.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border ${getWorkloadBadgeColor(emp.currentWorkload)}`}>
                                    {getWorkloadLabel(emp.currentWorkload)} ({emp.currentWorkload})
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-8 text-neutral-500">
                        No employees in this category
                    </div>
                )}
            </div>
        </motion.div>
    )
})