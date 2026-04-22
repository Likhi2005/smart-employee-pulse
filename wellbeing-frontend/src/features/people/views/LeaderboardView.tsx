import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { Trophy, TrendingUp, TrendingDown, Medal, Award, Star, Loader2 } from 'lucide-react'
import { useLeaderboard } from '../hooks/useLeaderboard'

type LeaderboardType = 'top' | 'month' | 'all'

export function LeaderboardView() {
    const [searchParams, setSearchParams] = useSearchParams()
    const periodParam = searchParams.get('period') as LeaderboardType | null
    const [activeTab, setActiveTab] = useState<LeaderboardType>(periodParam || 'top')

    const { data, loading, error } = useLeaderboard(activeTab)

    useEffect(() => {
        if (periodParam && ['top', 'month', 'all'].includes(periodParam)) {
            setActiveTab(periodParam)
        }
    }, [periodParam])

    const handleTabChange = (tab: LeaderboardType) => {
        setActiveTab(tab)
        setSearchParams({ period: tab })
    }

    const tabs = [
        { id: 'top', label: 'Top Performers', icon: Trophy },
        { id: 'month', label: 'This Month', icon: Star },
        { id: 'all', label: 'All Time', icon: Award },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-3xl font-bold text-neutral-50">Team Leaderboard</h2>
                <p className="mt-1 text-sm text-neutral-400">
                    Recognizing excellence and tracking performance growth.
                </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-neutral-800 pb-px">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id as LeaderboardType)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                                isActive ? 'text-amber-400' : 'text-neutral-400 hover:text-neutral-200'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {isActive && (
                                <motion.div
                                    layoutId="leaderboard-tab-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
                                    initial={false}
                                />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            <div className="min-h-[400px] relative">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="flex flex-col items-center text-amber-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                <span className="text-sm text-amber-400/80">Updating rankings...</span>
                            </div>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-center"
                        >
                            <p className="text-red-400">{error}</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {data.map((employee, index) => {
                                const isTop3 = index < 3
                                return (
                                    <motion.div
                                        key={employee.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`group flex items-center justify-between rounded-xl border p-4 transition-all hover:bg-neutral-900/80 ${
                                            index === 0
                                                ? 'border-amber-500/50 bg-amber-500/5'
                                                : index === 1
                                                ? 'border-zinc-300/40 bg-zinc-400/5'
                                                : index === 2
                                                ? 'border-orange-700/40 bg-orange-700/5'
                                                : 'border-neutral-800 bg-neutral-900/40'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Rank Badge */}
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                                                index === 0
                                                    ? 'bg-amber-500/20 text-amber-400'
                                                    : index === 1
                                                    ? 'bg-zinc-300/20 text-zinc-300'
                                                    : index === 2
                                                    ? 'bg-orange-700/20 text-orange-400'
                                                    : 'bg-neutral-800 text-neutral-400'
                                            }`}>
                                                {isTop3 ? <Medal className="w-5 h-5" /> : `#${employee.rank}`}
                                            </div>

                                            {/* Info */}
                                            <div>
                                                <h4 className="text-base font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors">
                                                    {employee.name}
                                                </h4>
                                                <p className="text-xs text-neutral-500">{employee.department}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            {/* Tasks */}
                                            <div className="text-right hidden sm:block">
                                                <div className="text-sm font-medium text-neutral-300">
                                                    {employee.tasksCompleted}
                                                </div>
                                                <div className="text-xs text-neutral-500">Tasks</div>
                                            </div>

                                            {/* Growth */}
                                            <div className="text-right w-20 hidden md:block">
                                                <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
                                                    employee.growth > 0 ? 'text-emerald-400' : 'text-rose-400'
                                                }`}>
                                                    {employee.growth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                    {Math.abs(employee.growth)}%
                                                </div>
                                                <div className="text-xs text-neutral-500">Growth</div>
                                            </div>

                                            {/* Score */}
                                            <div className="text-right min-w-[80px]">
                                                <div className="text-xl font-bold text-amber-400">
                                                    {employee.score}
                                                </div>
                                                <div className="text-xs text-neutral-500">Score</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
