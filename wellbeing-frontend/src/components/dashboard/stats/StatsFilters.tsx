import { motion } from 'framer-motion'
import { Calendar, Filter } from 'lucide-react'
import { useState } from 'react'
import type { ManagerDashboard } from '@/services/dashboardService'

interface StatsFiltersProps {
    dashboardData: ManagerDashboard
}

export function StatsFilters({ dashboardData }: StatsFiltersProps) {
    const [dateRange, setDateRange] = useState('week')
    const [selectedEmployee, setSelectedEmployee] = useState('all')

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-4 mb-6"
        >
            <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2.5">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-transparent text-sm text-neutral-50 focus:outline-none"
                >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                </select>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2.5">
                <Filter className="h-4 w-4 text-neutral-400" />
                <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="bg-transparent text-sm text-neutral-50 focus:outline-none"
                >
                    <option value="all">All Employees ({dashboardData.teamStats.totalEmployees})</option>
                    <option value="overloaded">Overloaded Only ({dashboardData.teamWorkload.filter(e => e.currentWorkload > 30).length})</option>
                    <option value="available">Available Only ({dashboardData.teamWorkload.filter(e => e.currentWorkload < 15).length})</option>
                </select>
            </div>
        </motion.div>
    )
}