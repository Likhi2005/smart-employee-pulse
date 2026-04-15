import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DotMap } from '@/components/auth/DotMap'
import { ArrowRight } from 'lucide-react'

interface AuthLayoutProps {
    title: string
    subtitle: string
    children: React.ReactNode
    showMap?: boolean
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    title,
    subtitle,
    children,
    showMap = true,
}) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl overflow-hidden rounded-2xl flex bg-white text-slate-900 shadow-2xl min-h-[600px]"
            >
                {/* Left side - Map/Visual */}
                {showMap && (
                    <div className="hidden lg:flex w-1/2 h-auto min-h-[600px] relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
                        {/* DotMap Background - Full Container */}
                        <div className="absolute inset-0 w-full h-full">
                            <DotMap />
                        </div>

                        {/* Overlay Content - Centered */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 bg-gradient-to-t from-slate-900/85 via-slate-900/40 to-slate-900/60">
                            {/* Logo Icon */}
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="mb-8"
                            >
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-2xl">
                                    <ArrowRight className="text-white h-8 w-8" />
                                </div>
                            </motion.div>

                            {/* Main Title */}
                            <motion.h2
                                initial={{ opacity: 0, y: -15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-5xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-300"
                            >
                                WorkPulse
                            </motion.h2>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="text-xl font-semibold text-slate-200 mb-8"
                            >
                                AI
                            </motion.p>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="text-base text-center text-slate-300 max-w-sm leading-relaxed mb-12"
                            >
                                Smart task assignment & workload management system for high-performing teams
                            </motion.p>

                            {/* Features List */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                                className="space-y-4 w-full max-w-xs"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                                    <span className="text-slate-200 text-sm">AI-powered task suggestions</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                                    <span className="text-slate-200 text-sm">Real-time workload tracking</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                                    <span className="text-slate-200 text-sm">Team performance insights</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                                    <span className="text-slate-200 text-sm">Smart workload balancing</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* Right side - Form */}
                <div
                    className={cn(
                        'w-full flex flex-col justify-center',
                        showMap ? 'lg:w-1/2' : 'w-full',
                        'p-8 md:p-12 min-h-[600px]'
                    )}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-8 w-full max-w-md"
                    >
                        {/* Header */}
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold text-slate-900">{title}</h1>
                            <p className="text-slate-500 text-base leading-relaxed">{subtitle}</p>
                        </div>

                        {/* Form Content */}
                        <div className="space-y-6">{children}</div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

// Helper function
function cn(...classes: (string | boolean | undefined)[]): string {
    return classes
        .filter((cls): cls is string => typeof cls === 'string' && cls.length > 0)
        .join(' ')
}