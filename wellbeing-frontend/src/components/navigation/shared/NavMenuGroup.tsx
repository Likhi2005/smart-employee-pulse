import React from 'react'
import { LucideIcon, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { NavSubItem } from './NavSubItem'

interface SubItem {
    icon?: LucideIcon
    label: string
    to: string
    badge?: number
}

interface NavMenuGroupProps {
    icon: LucideIcon
    label: string
    to: string
    subItems: SubItem[]
    isExpanded: boolean
    isActive: boolean
    badge?: number
}

export const NavMenuGroup: React.FC<NavMenuGroupProps> = ({
    icon: Icon,
    label,
    to,
    subItems,
    isExpanded,
    isActive,
    badge,
}) => {
    const location = useLocation()
    const isSubItemActive = subItems.some(sub => sub.to === location.pathname)

    return (
        <div className="space-y-1">
            <Link to={to}>
                <motion.div
                    className={cn(
                        'w-full flex items-center rounded-lg transition-colors duration-200 cursor-pointer',
                        isExpanded ? 'gap-3 px-3 py-2' : 'justify-center p-2',
                        isActive
                            ? 'bg-amber-900/30 text-amber-400 border border-amber-800/50'
                            : 'text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100'
                    )}
                    whileHover={{ x: 4 }}
                >
                    <Icon size={16} className="flex-shrink-0" />
                    {isExpanded && (
                        <motion.span className="flex-1 text-left text-sm font-medium">
                            {label}
                        </motion.span>
                    )}
                    {isExpanded && subItems.length > 0 && (
                        <motion.div
                            animate={{ rotate: isActive || isSubItemActive ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={14} className={isActive || isSubItemActive ? 'text-amber-400' : 'text-neutral-500'} />
                        </motion.div>
                    )}
                    {isExpanded && badge && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto"
                        >
                            {badge}
                        </motion.span>
                    )}
                </motion.div>
            </Link>

            <AnimatePresence>
                {(isActive || isSubItemActive) && isExpanded && subItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-2 space-y-1"
                    >
                        {subItems.map((subItem, idx) => (
                            <NavSubItem
                                key={idx}
                                icon={subItem.icon}
                                label={subItem.label}
                                to={subItem.to}
                                isExpanded={isExpanded}
                                badge={subItem.badge}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}