import React from 'react'
import { motion } from 'framer-motion'

interface MenuSectionProps {
    title: string
    isExpanded: boolean
    isCollapsed?: boolean
}

export const MenuSection: React.FC<MenuSectionProps & { children: React.ReactNode }> = ({
    title,
    isExpanded,
    isCollapsed = false,
    children,
}) => {
    return (
        <div className="flex flex-col w-full">
            <div
                className={`relative shrink-0 w-full transition-all duration-500 overflow-hidden ${isCollapsed || !isExpanded ? 'h-0 opacity-0' : 'h-8 opacity-100'
                    }`}
            >
                <div className="flex items-center h-8 px-4 py-2">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        {title}
                    </div>
                </div>
            </div>
            <div className="space-y-1">{children}</div>
        </div>
    )
}