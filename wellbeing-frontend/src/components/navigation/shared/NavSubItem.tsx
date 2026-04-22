import React from 'react'
import { LucideIcon, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface NavSubItemProps {
    icon?: LucideIcon
    label: string
    to: string
    isExpanded: boolean
    badge?: number
}

export const NavSubItem: React.FC<NavSubItemProps> = ({
    icon: Icon,
    label,
    to,
    isExpanded,
    badge,
}) => {
    const location = useLocation()
    const isActive = location.pathname === to
    const FallbackIcon = FileText

    return (
        <Link to={to}>
            <motion.div
                className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer',
                    isActive
                        ? 'bg-neutral-800 text-neutral-50'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                )}
                whileHover={{ x: 4 }}
            >
                <span className={isActive ? 'text-amber-500' : ''}>
                    {Icon ? <Icon size={16} className="flex-shrink-0" /> : <FallbackIcon size={16} className="flex-shrink-0" />}
                </span>
                {isExpanded && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm flex-1"
                    >
                        {label}
                    </motion.span>
                )}
                {isExpanded && badge && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    >
                        {badge}
                    </motion.span>
                )}
            </motion.div>
        </Link>
    )
}