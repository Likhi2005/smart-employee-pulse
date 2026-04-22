import React from 'react'
import { Navbar } from '@/components/blocks/Navbar'
import { HeroSection } from '@/components/blocks/HeroSection'

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-neutral-950">
            <Navbar />
            <HeroSection />
            {/* Additional sections will be added here later */}
            <footer className="bg-neutral-900 text-neutral-400 py-12 border-t border-amber-800/20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="mb-2">© 2024 WorkPulse AI. All rights reserved.</p>
                    <p className="text-neutral-500 text-sm">
                        Smart Task Assignment & Workload Management System
                    </p>
                </div>
            </footer>
        </div>
    )
}