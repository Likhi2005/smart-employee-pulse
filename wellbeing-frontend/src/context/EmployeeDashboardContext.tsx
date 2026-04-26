import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useEmployeeDashboard, type UseEmployeeDashboardReturn } from '@/hooks/useEmployeeDashboard'

// ============================================================
// CONTEXT TYPE
// ============================================================

interface EmployeeDashboardContextValue extends UseEmployeeDashboardReturn {
    searchQuery: string
    setSearchQuery: (q: string) => void
    selectedTask: import('@/types').TaskItem | null
    setSelectedTask: (task: import('@/types').TaskItem | null) => void
}

// ============================================================
// CONTEXT
// ============================================================

const EmployeeDashboardContext = createContext<EmployeeDashboardContextValue | null>(null)

// ============================================================
// PROVIDER
// ============================================================

export function EmployeeDashboardProvider({ children }: { children: ReactNode }) {
    const dashboardHook = useEmployeeDashboard()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTask, setSelectedTask] = useState<import('@/types').TaskItem | null>(null)

    const value: EmployeeDashboardContextValue = {
        ...dashboardHook,
        searchQuery,
        setSearchQuery,
        selectedTask,
        setSelectedTask,
    }

    return (
        <EmployeeDashboardContext.Provider value={value}>
            {children}
        </EmployeeDashboardContext.Provider>
    )
}

// ============================================================
// CONSUMER HOOK
// ============================================================

export function useEmployeeDashboardCtx(): EmployeeDashboardContextValue {
    const ctx = useContext(EmployeeDashboardContext)
    if (!ctx) {
        throw new Error('useEmployeeDashboardCtx must be used within EmployeeDashboardProvider')
    }
    return ctx
}
