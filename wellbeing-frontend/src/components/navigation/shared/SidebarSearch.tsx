import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'

interface SidebarSearchProps {
    isCollapsed?: boolean
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({ isCollapsed = false }) => {
    const [searchValue, setSearchValue] = useState('')

    return (
        <div
            className={`relative shrink-0 transition-all duration-500 ${isCollapsed ? 'w-full flex justify-center' : 'w-full'
                }`}
        >
            <div
                className={`bg-neutral-900 h-10 relative rounded-lg flex items-center transition-all duration-500 border border-neutral-800 ${isCollapsed ? 'w-10 min-w-10 justify-center' : 'w-full'
                    }`}
            >
                <div
                    className={`flex items-center justify-center shrink-0 transition-all duration-500 ${isCollapsed ? 'p-1' : 'px-2'
                        }`}
                >
                    <Search size={16} className="text-neutral-400" />
                </div>

                <div
                    className={`flex-1 relative transition-opacity duration-500 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                        }`}
                >
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-sm text-neutral-200 placeholder:text-neutral-500"
                    />
                </div>
            </div>
        </div>
    )
}