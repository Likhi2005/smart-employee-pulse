import { Search, X } from 'lucide-react'
import { useCallback, useState, useEffect } from 'react'

interface TemplateFiltersBarProps {
    search: string
    onSearchChange: (value: string) => void
    department: string
    onDepartmentChange: (value: string) => void
    departments: string[]
    includeInactive: boolean
    onIncludeInactiveChange: (value: boolean) => void
    onReset: () => void
    hasActiveFilters: boolean
}

export function TemplateFiltersBar({
    search,
    onSearchChange,
    department,
    onDepartmentChange,
    departments,
    includeInactive,
    onIncludeInactiveChange,
    onReset,
    hasActiveFilters,
}: TemplateFiltersBarProps) {
    const [debouncedSearch, setDebouncedSearch] = useState(search)

    // Debounce search input (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(debouncedSearch)
        }, 300)
        return () => clearTimeout(timer)
    }, [debouncedSearch, onSearchChange])

    const handleClearSearch = useCallback(() => {
        setDebouncedSearch('')
        onSearchChange('')
    }, [onSearchChange])

    return (
        <div className="space-y-3">
            {/* Search bar */}
            <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                    type="text"
                    placeholder="Search templates by name or title..."
                    value={debouncedSearch}
                    onChange={(e) => setDebouncedSearch(e.target.value)}
                    className="h-10 w-full rounded-lg border border-neutral-700 bg-neutral-900 pl-9 pr-8 text-sm text-neutral-100 placeholder-neutral-500 outline-none transition focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20"
                />
                {debouncedSearch && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-400"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Filter row */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                {/* Department filter */}
                <select
                    value={department}
                    onChange={(e) => onDepartmentChange(e.target.value)}
                    className="h-10 rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none transition focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20"
                >
                    <option value="">All departments</option>
                    {departments.map((dept) => (
                        <option key={dept} value={dept}>
                            {dept}
                        </option>
                    ))}
                </select>

                {/* Status filter */}
                <button
                    type="button"
                    onClick={() => onIncludeInactiveChange(!includeInactive)}
                    className={[
                        'h-10 rounded-lg border px-3 text-sm font-medium transition',
                        includeInactive
                            ? 'border-amber-500/60 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                            : 'border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800',
                    ].join(' ')}
                >
                    {includeInactive ? 'All templates' : 'Active only'}
                </button>

                {/* Reset button */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="h-10 rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-200 transition hover:bg-neutral-800"
                    >
                        Reset filters
                    </button>
                )}
            </div>
        </div>
    )
}