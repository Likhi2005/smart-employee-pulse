import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, BarChart3, CheckSquare, Zap, Users, Trophy, Settings, LogOut, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface IconRailItem {
    icon: LucideIcon
    to: string
    tooltip: string
    isActive: boolean
}

interface SidebarIconRailProps {
    items: IconRailItem[]
    onLogout?: () => void
    isDetailExpanded?: boolean
    onToggleDetail?: () => void
}

export const SidebarIconRail: React.FC<SidebarIconRailProps> = ({
    items,
    onLogout,
    isDetailExpanded = true,
    onToggleDetail,
}) => {
    return (
        <aside className="bg-black flex flex-col gap-2 items-center p-3 w-16 h-screen border-r border-neutral-800">
            {/* Logo - Now toggles detail sidebar instead of navigating */}
            <motion.button
                onClick={onToggleDetail}
                title="Toggle Navigation"
                className="mb-2 size-10 flex items-center justify-center bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="text-white font-bold text-sm">WP</div>
            </motion.button>

            {/* Navigation Icons */}
            <div className="flex flex-col gap-2 w-full items-center flex-1">
                {items.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link key={item.to} to={item.to} title={item.tooltip}>
                            <motion.div
                                className={cn(
                                    'w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200',
                                    item.isActive
                                        ? 'bg-amber-700 text-white'
                                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                                )}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Icon size={18} />
                            </motion.div>
                        </Link>
                    )
                })}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-2 w-full items-center border-t border-neutral-800 pt-2 pb-2">
                {/* Expand Button (Show when detail sidebar is collapsed) */}
                {!isDetailExpanded && onToggleDetail && (
                    <motion.button
                        onClick={onToggleDetail}
                        title="Expand"
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ChevronRight size={18} />
                    </motion.button>
                )}

                <motion.button
                    title="Settings"
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Settings size={18} />
                </motion.button>

                <motion.button
                    onClick={onLogout}
                    title="Logout"
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <LogOut size={18} />
                </motion.button>
            </div>
        </aside>
    )
}