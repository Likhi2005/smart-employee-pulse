import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface EmployeeLayoutProps {
    children: ReactNode
}

export function EmployeeLayout({ children }: EmployeeLayoutProps) {
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
        navigate('/login', { replace: true })
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
            <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Employee Workspace</p>
                        <h1 className="text-sm font-semibold text-neutral-100 sm:text-base">Personal Command Center</h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300"
                        >
                            <Bell size={14} />
                            Signals
                        </button>

                        <div className="hidden items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 sm:inline-flex">
                            <User size={14} className="text-neutral-400" />
                            <div className="text-left">
                                <p className="text-xs font-medium text-neutral-100">{user?.fullName || 'Employee'}</p>
                                <p className="text-[11px] text-neutral-500">{user?.email || '-'}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2 text-xs text-red-300 hover:bg-red-950/40"
                        >
                            <LogOut size={14} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
                {children}
            </main>
        </div>
    )
}