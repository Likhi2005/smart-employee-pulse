import React, { useState } from 'react'
import { LucideIcon, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import { NavSubItem } from './NavSubItem'

interface SubItem {
    icon: LucideIcon
    label: string
    to: string
    badge?: number
}

interface NavMenuGroupProps {
    icon: LucideIcon
    label: string
    subItems: SubItem[]
    isExpanded: boolean
    sectionTitle?: string
}

export const NavMenuGroup: React.FC<NavMenuGroupProps> = ({
    icon: Icon,
    label,
    subItems,
    isExpanded,
    sectionTitle,
}) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="space-y-1">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200',
                    'text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100'
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
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown size={14} className="text-neutral-500" />
                    </motion.div>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && isExpanded && subItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
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