import React, { useEffect, useMemo, useState } from 'react'
import { Search, Filter, RefreshCw } from 'lucide-react'
import api from '@/services/api'
import { ResizableTable, type EmployeeRow } from '@/components/ui/resizable-table'

interface BackendEmployee {
    _id: string
    fullName: string
    email: string
    department?: string
    currentWorkload?: number
    isActive?: boolean
    isPasswordChanged?: boolean
    createdAt: string
}

interface EmployeeListProps {
    onView?: (employeeId: string) => void
    onEdit?: (employeeId: string) => void
    onDelete?: (employeeId: string) => void
    refreshKey?: number
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
    onView,
    onEdit,
    onDelete,
    refreshKey = 0,
}) => {
    const [employees, setEmployees] = useState<EmployeeRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [department, setDepartment] = useState('')
    const [status, setStatus] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [isReloading, setIsReloading] = useState(false)

    const limit = 10

    const departmentOptions = [
        'Engineering',
        'Product',
        'Design',
        'Marketing',
        'Sales',
        'HR',
        'Finance',
        'Operations',
        'Other',
    ]

    const buildParams = () => {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(limit))
        if (search.trim()) params.set('search', search.trim())
        if (department) params.set('department', department)
        if (status) params.set('status', status)
        return params.toString()
    }

    const loadEmployees = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await api.get(`/employees?${buildParams()}`)
            const data = response.data?.data || []
            const meta = response.data?.meta || {}

            const rows: EmployeeRow[] = (data as BackendEmployee[]).map((emp) => ({
                id: emp._id,
                name: emp.fullName,
                email: emp.email,
                department: emp.department || 'Not specified',
                workload: Number(emp.currentWorkload || 0),
                status: emp.isActive ? 'active' : 'inactive',
                passwordStatus: emp.isPasswordChanged ? 'changed' : 'pending',
                createdAt: emp.createdAt,
            }))

            setEmployees(rows)
            setTotalPages(Number(meta.totalPages || 1))
            setTotalItems(Number(meta.total || rows.length))
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load employees')
        } finally {
            setLoading(false)
            setIsReloading(false)
        }
    }

    useEffect(() => {
        loadEmployees()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, refreshKey])

    const handleApplyFilters = async () => {
        setPage(1)
        setIsReloading(true)
        setTimeout(() => {
            loadEmployees()
        }, 0)
    }

    const handleReset = async () => {
        setSearch('')
        setDepartment('')
        setStatus('')
        setPage(1)
        setIsReloading(true)
        setTimeout(() => {
            loadEmployees()
        }, 0)
    }

    const content = useMemo(() => {
        if (loading && !isReloading) {
            return (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6 text-sm text-neutral-400">
                    Loading employees...
                </div>
            )
        }

        if (error) {
            return (
                <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-6 text-sm text-red-300">
                    {error}
                </div>
            )
        }

        return (
            <ResizableTable
                title="Employee"
                employees={employees}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                className="w-full"
                enableAnimations={false}
            />
        )
    }, [loading, isReloading, error, employees, onView])

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 md:p-5">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        <div className="relative w-full lg:max-w-sm">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search employees..."
                                className="h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 pl-9 pr-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-700"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                                <select
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="h-10 min-w-[180px] rounded-md border border-neutral-800 bg-neutral-900 pl-9 pr-3 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-700"
                                >
                                    <option value="">All departments</option>
                                    {departmentOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-10 min-w-[160px] rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-700"
                            >
                                <option value="">All statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <button
                                onClick={handleApplyFilters}
                                className="inline-flex h-10 items-center gap-2 rounded-md bg-amber-700 px-4 text-sm font-medium text-white hover:bg-amber-800 transition-colors"
                            >
                                Apply
                            </button>

                            <button
                                onClick={handleReset}
                                className="inline-flex h-10 items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-4 text-sm font-medium text-neutral-200 hover:bg-neutral-800 transition-colors"
                            >
                                <RefreshCw size={15} />
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>
                            {totalItems} employee{totalItems === 1 ? '' : 's'} found
                        </span>
                        <button
                            onClick={loadEmployees}
                            className="text-neutral-400 hover:text-neutral-200 transition-colors"
                        >
                            Refresh data
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {content}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-1">
                    <div className="text-xs text-neutral-500">
                        Page {page} of {totalPages} • {totalItems} employees
                    </div>

                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={page === totalPages}
                            className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}