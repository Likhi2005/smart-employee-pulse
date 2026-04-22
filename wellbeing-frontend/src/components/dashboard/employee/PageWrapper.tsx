import React from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

// ============================================================
// PAGE WRAPPER — consistent padding + max-width for all pages
// ============================================================

interface PageWrapperProps {
    children: React.ReactNode
    loading?: boolean
    error?: string | null
    onRetry?: () => void
}

function LoadingSkeleton() {
    return (
        <div className="space-y-5 animate-pulse">
            <div className="h-8 w-48 bg-neutral-800 rounded-lg" />
            <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map(i => <div key={i} className="h-40 rounded-2xl bg-neutral-800" />)}
            </div>
            <div className="h-64 rounded-2xl bg-neutral-800" />
            <div className="grid grid-cols-2 gap-4">
                {[0, 1].map(i => <div key={i} className="h-48 rounded-2xl bg-neutral-800" />)}
            </div>
        </div>
    )
}

export function PageWrapper({ children, loading, error, onRetry }: PageWrapperProps) {
    if (loading) {
        return (
            <div className="max-w-[1600px] mx-auto px-5 py-6">
                <LoadingSkeleton />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-sm">
                    <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={24} className="text-rose-400" />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-200 mb-2">Failed to load</h3>
                    <p className="text-sm text-neutral-500 mb-5">{error}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-sm font-medium text-cyan-400 hover:bg-cyan-500/25 transition-colors"
                        >
                            <RefreshCw size={14} />
                            Retry
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-5 py-6 space-y-6">
            {children}
        </div>
    )
}
