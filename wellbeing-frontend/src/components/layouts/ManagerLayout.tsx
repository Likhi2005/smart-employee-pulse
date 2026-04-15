import React from 'react'
import { ManagerSidebar } from '@/components/navigation/ManagerSidebar'
import { TopHeader } from '@/components/navigation/TopHeader'

interface ManagerLayoutProps {
    children: React.ReactNode
}

export const ManagerLayout: React.FC<ManagerLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-neutral-950">
            {/* Sidebar - Fixed: 64px (icon rail) + 320px (detail) = 384px */}
            <ManagerSidebar />

            {/* Main content area */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top Header */}
                <TopHeader />

                {/* Main content - scrollable */}
                <main className="flex-1 overflow-auto bg-neutral-950">{children}</main>
            </div>
        </div>
    )
}