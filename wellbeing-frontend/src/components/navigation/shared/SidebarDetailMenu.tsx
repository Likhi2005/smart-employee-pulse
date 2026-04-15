import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface SidebarDetailMenuProps {
    isExpanded: boolean
    onClose?: () => void
    children: React.ReactNode
}

export const SidebarDetailMenu: React.FC<SidebarDetailMenuProps> = ({
    isExpanded,
    onClose,
    children,
}) => {
    return (
        <AnimatePresence>
            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 bg-white border-r border-gray-200 p-4 overflow-y-auto"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                        {onClose && (
                            <motion.button
                                onClick={onClose}
                                whileTap={{ scale: 0.95 }}
                                className="p-1 hover:bg-gray-100 rounded-md"
                            >
                                <X size={20} className="text-gray-500" />
                            </motion.button>
                        )}
                    </div>
                    <div className="space-y-2">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}