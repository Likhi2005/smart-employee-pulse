import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const TopHeader: React.FC = () => {
    const [showNotifications, setShowNotifications] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const navigate = useNavigate()

    const handleLogout = () => {
        navigate('/login')
    }

    return (
        <header className="bg-black border-b border-neutral-800 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Left: Search Bar */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks, employees..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Notifications */}
                <div className="relative">
                    <motion.button
                        onClick={() => setShowNotifications(!showNotifications)}
                        whileHover={{ scale: 1.05 }}
                        className="relative p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </motion.button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-80 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-50"
                            >
                                <div className="p-4 border-b border-neutral-800">
                                    <h3 className="text-sm font-semibold text-neutral-50">Notifications</h3>
                                </div>
                                <div className="space-y-2 p-3 max-h-96 overflow-y-auto">
                                    <div className="p-3 bg-neutral-800 rounded-lg text-sm text-neutral-300">
                                        <p className="font-medium text-neutral-200">Task assigned</p>
                                        <p className="text-xs text-neutral-400 mt-1">You have 3 new tasks</p>
                                    </div>
                                    <div className="p-3 bg-neutral-800 rounded-lg text-sm text-neutral-300">
                                        <p className="font-medium text-neutral-200">Workload alert</p>
                                        <p className="text-xs text-neutral-400 mt-1">Team overload detected</p>
                                    </div>
                                    <div className="p-3 bg-neutral-800 rounded-lg text-sm text-neutral-300">
                                        <p className="font-medium text-neutral-200">Report ready</p>
                                        <p className="text-xs text-neutral-400 mt-1">Weekly report is available</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative">
                    <motion.button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <User size={16} className="text-white" />
                        </div>
                        <span className="text-sm text-neutral-200">Manager</span>
                        <ChevronDown size={16} />
                    </motion.button>

                    <AnimatePresence>
                        {showUserMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-50"
                            >
                                <div className="p-3 border-b border-neutral-800">
                                    <p className="text-sm font-semibold text-neutral-50">John Manager</p>
                                    <p className="text-xs text-neutral-400">manager@company.com</p>
                                </div>
                                <div className="p-2 space-y-1">
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 rounded-md transition-colors">
                                        <User size={16} />
                                        Edit Profile
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 rounded-md transition-colors">
                                        <Settings size={16} />
                                        Settings
                                    </button>
                                    <hr className="border-neutral-700 my-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-950 rounded-md transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}