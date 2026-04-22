import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Download, ChevronDown, Search, Eye, PencilLine, Trash2 } from 'lucide-react'
import { Resizable } from 'react-resizable'
import 'react-resizable/css/styles.css'
import { cn } from '@/utils/cn'

export interface EmployeeRow {
    id: string
    name: string
    email: string
    department: string
    workload: number
    status: 'active' | 'inactive'
    passwordStatus: 'changed' | 'pending'
    createdAt: string
}

interface ResizableTableProps {
    title?: string
    employees?: EmployeeRow[]
    onView?: (employeeId: string) => void
    onEdit?: (employeeId: string) => void
    onDelete?: (employeeId: string) => void
    onColumnResize?: (columnKey: string, newWidth: number) => void
    className?: string
    enableAnimations?: boolean
}

type SortField = 'name' | 'department' | 'workload' | 'createdAt' | 'status'
type SortOrder = 'asc' | 'desc'

export function ResizableTable({
    title = 'Employee',
    employees: initialEmployees = [],
    onView,
    onEdit,
    onDelete,
    onColumnResize,
    className = '',
    enableAnimations = true,
}: ResizableTableProps = {}) {
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [sortField, setSortField] = useState<SortField | null>(null)
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
    const [showSortMenu, setShowSortMenu] = useState(false)
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const shouldReduceMotion = useReducedMotion()

    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
        checkbox: 52,
        name: 190,
        email: 250,
        department: 150,
        workload: 110,
        status: 120,
        passwordStatus: 150,
        createdAt: 135,
        actions: 120,
    })

    const ITEMS_PER_PAGE = 10
    const shouldAnimate = enableAnimations && !shouldReduceMotion

    const filteredEmployees = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return initialEmployees

        return initialEmployees.filter((employee) => {
            return (
                employee.name.toLowerCase().includes(query) ||
                employee.email.toLowerCase().includes(query) ||
                employee.department.toLowerCase().includes(query) ||
                employee.status.toLowerCase().includes(query) ||
                employee.passwordStatus.toLowerCase().includes(query)
            )
        })
    }, [initialEmployees, searchQuery])

    const sortedEmployees = useMemo(() => {
        if (!sortField) return filteredEmployees

        return [...filteredEmployees].sort((a, b) => {
            let aVal: string | number = a[sortField]
            let bVal: string | number = b[sortField]

            if (sortField === 'createdAt') {
                aVal = new Date(a.createdAt).getTime()
                bVal = new Date(b.createdAt).getTime()
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
            return 0
        })
    }, [filteredEmployees, sortField, sortOrder])

    const paginatedEmployees = useMemo(() => {
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
        return sortedEmployees.slice(startIdx, startIdx + ITEMS_PER_PAGE)
    }, [sortedEmployees, currentPage])

    const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / ITEMS_PER_PAGE))

    const handleSelectAll = () => {
        if (selectedEmployees.length === paginatedEmployees.length) {
            setSelectedEmployees([])
            return
        }

        setSelectedEmployees(paginatedEmployees.map((employee) => employee.id))
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
        setShowSortMenu(false)
        setCurrentPage(1)
    }

    const handleResize = (columnKey: string, { size }: { size: { width: number } }) => {
        const newWidth = Math.max(80, Math.min(420, size.width))
        setColumnWidths((prev) => ({ ...prev, [columnKey]: newWidth }))
        onColumnResize?.(columnKey, newWidth)
    }

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })

    const exportToCSV = () => {
        const headers = [
            'Name',
            'Email',
            'Department',
            'Workload',
            'Status',
            'Password Status',
            'Created At',
        ]

        const rows = sortedEmployees.map((employee) => [
            employee.name,
            employee.email,
            employee.department,
            employee.workload,
            employee.status,
            employee.passwordStatus,
            employee.createdAt,
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
            ),
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `employees-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
    }

    const exportToJSON = () => {
        const content = JSON.stringify(sortedEmployees, null, 2)
        const blob = new Blob([content], { type: 'application/json;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `employees-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
    }

    const containerVariants = {
        visible: {
            transition: {
                staggerChildren: 0.03,
                delayChildren: 0.08,
            },
        },
    }

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 350,
                damping: 28,
                mass: 0.7,
            },
        },
    }

    return (
        <div className={cn('w-full', className)}>
            <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="relative w-full lg:max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder="Search by name, email, department..."
                        className="w-full h-10 pl-9 pr-3 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowSortMenu((value) => !value)}
                            className="px-3 py-1.5 border border-neutral-700 bg-neutral-900 text-neutral-200 text-sm hover:bg-neutral-800 transition-colors flex items-center gap-2 rounded-md"
                        >
                            Sort
                            {sortField && (
                                <span className="ml-1 text-xs bg-neutral-700 text-neutral-100 rounded-sm px-1.5 py-0.5">
                                    1
                                </span>
                            )}
                            <ChevronDown size={14} className="opacity-60" />
                        </button>

                        {showSortMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                                <div className="absolute right-0 mt-1 w-48 bg-neutral-950 border border-neutral-800 rounded-md z-20 py-1 shadow-xl">
                                    <button onClick={() => handleSort('name')} className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900">
                                        Name
                                    </button>
                                    <button onClick={() => handleSort('department')} className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900">
                                        Department
                                    </button>
                                    <button onClick={() => handleSort('workload')} className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900">
                                        Workload
                                    </button>
                                    <button onClick={() => handleSort('status')} className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900">
                                        Status
                                    </button>
                                    <button onClick={() => handleSort('createdAt')} className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900">
                                        Created At
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu((value) => !value)}
                            className="px-3 py-1.5 border border-neutral-700 bg-neutral-900 text-neutral-200 text-sm hover:bg-neutral-800 transition-colors flex items-center gap-2 rounded-md"
                        >
                            <Download size={14} />
                            Export
                            <ChevronDown size={14} className="opacity-60" />
                        </button>

                        {showExportMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                                <div className="absolute right-0 mt-1 w-32 bg-neutral-950 border border-neutral-800 rounded-md z-20 shadow-xl">
                                    <button
                                        onClick={() => {
                                            exportToCSV()
                                            setShowExportMenu(false)
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900"
                                    >
                                        CSV
                                    </button>
                                    <button
                                        onClick={() => {
                                            exportToJSON()
                                            setShowExportMenu(false)
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900 border-t border-neutral-800"
                                    >
                                        JSON
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                    <div className="min-w-[1240px]">
                        <div className="flex py-3 text-xs font-medium text-neutral-400 bg-neutral-900 border-b border-neutral-800">
                            <div className="flex items-center justify-center border-r border-neutral-800 pr-3" style={{ width: columnWidths.checkbox }}>
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-neutral-700 cursor-pointer accent-amber-700"
                                    checked={paginatedEmployees.length > 0 && selectedEmployees.length === paginatedEmployees.length}
                                    onChange={handleSelectAll}
                                />
                            </div>

                            {[
                                { key: 'name', label: title },
                                { key: 'email', label: 'Email' },
                                { key: 'department', label: 'Department' },
                                { key: 'workload', label: 'Workload' },
                                { key: 'status', label: 'Status' },
                                { key: 'passwordStatus', label: 'Password' },
                                { key: 'createdAt', label: 'Created At' },
                                { key: 'actions', label: 'Actions' },
                            ].map((column) => (
                                <Resizable
                                    key={column.key}
                                    width={columnWidths[column.key]}
                                    height={0}
                                    onResize={(e, data) => handleResize(column.key, data)}
                                    minConstraints={[90, 0]}
                                    maxConstraints={[420, 0]}
                                    handle={
                                        <div className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-amber-700/50 transition-all" />
                                    }
                                >
                                    <div
                                        className="flex items-center border-r border-neutral-800 px-3 relative"
                                        style={{ width: columnWidths[column.key] }}
                                    >
                                        <span>{column.label}</span>
                                    </div>
                                </Resizable>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`page-${currentPage}`}
                                variants={shouldAnimate ? containerVariants : {}}
                                initial={shouldAnimate ? 'hidden' : 'visible'}
                                animate="visible"
                            >
                                {paginatedEmployees.map((employee) => (
                                    <motion.div key={employee.id} variants={shouldAnimate ? rowVariants : {}}>
                                        <div
                                            className={cn(
                                                'py-3.5 border-b border-neutral-800 flex transition-colors',
                                                selectedEmployees.includes(employee.id)
                                                    ? 'bg-neutral-900/70'
                                                    : 'bg-neutral-950 hover:bg-neutral-900/40'
                                            )}
                                        >
                                            <div className="flex items-center justify-center border-r border-neutral-800 pr-3" style={{ width: columnWidths.checkbox }}>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-neutral-700 cursor-pointer accent-amber-700"
                                                    checked={selectedEmployees.includes(employee.id)}
                                                    onChange={() =>
                                                        setSelectedEmployees((prev) =>
                                                            prev.includes(employee.id)
                                                                ? prev.filter((id) => id !== employee.id)
                                                                : [...prev, employee.id]
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center min-w-0 border-r border-neutral-800 px-3" style={{ width: columnWidths.name }}>
                                                <span className="text-sm text-neutral-100 truncate">{employee.name}</span>
                                            </div>

                                            <div className="flex items-center min-w-0 border-r border-neutral-800 px-3" style={{ width: columnWidths.email }}>
                                                <a
                                                    href={`mailto:${employee.email}`}
                                                    className="text-sm text-blue-400 hover:text-blue-300 truncate"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {employee.email}
                                                </a>
                                            </div>

                                            <div className="flex items-center border-r border-neutral-800 px-3" style={{ width: columnWidths.department }}>
                                                <span className="text-sm text-neutral-300 truncate">{employee.department}</span>
                                            </div>

                                            <div className="flex items-center border-r border-neutral-800 px-3" style={{ width: columnWidths.workload }}>
                                                <span className="text-sm font-semibold text-neutral-200">{employee.workload}</span>
                                            </div>

                                            <div className="flex items-center px-3 border-r border-neutral-800" style={{ width: columnWidths.status }}>
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md',
                                                        employee.status === 'active'
                                                            ? 'bg-green-500/10 text-green-400'
                                                            : 'bg-red-500/10 text-red-400'
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            'w-1.5 h-1.5 rounded-full',
                                                            employee.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                                                        )}
                                                    />
                                                    {employee.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center px-3 border-r border-neutral-800" style={{ width: columnWidths.passwordStatus }}>
                                                <span
                                                    className={cn(
                                                        'text-xs font-medium',
                                                        employee.passwordStatus === 'changed'
                                                            ? 'text-emerald-400'
                                                            : 'text-amber-400'
                                                    )}
                                                >
                                                    {employee.passwordStatus}
                                                </span>
                                            </div>

                                            <div className="flex items-center px-3 border-r border-neutral-800" style={{ width: columnWidths.createdAt }}>
                                                <span className="text-sm text-neutral-300">{formatDate(employee.createdAt)}</span>
                                            </div>

                                            <div className="flex items-center gap-1 px-3" style={{ width: columnWidths.actions }}>
                                                <button
                                                    type="button"
                                                    onClick={() => onView?.(employee.id)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit?.(employee.id)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
                                                    title="Edit"
                                                >
                                                    <PencilLine size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete?.(employee.id)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {paginatedEmployees.length === 0 && (
                            <div className="px-4 py-10 text-center text-neutral-500 text-sm">
                                No employees found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between px-1">
                <div className="text-xs text-neutral-500">
                    Page {currentPage} of {totalPages} • {sortedEmployees.length} employees
                </div>

                <div className="flex gap-1.5">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}