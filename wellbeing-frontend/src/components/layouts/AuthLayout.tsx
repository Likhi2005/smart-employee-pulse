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
        <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl overflow-hidden rounded-2xl flex bg-neutral-900 text-neutral-50 shadow-2xl min-h-[600px] border border-amber-800/30"
            >
                {/* Left side - Map/Visual */}
                {showMap && (
                    <div className="hidden lg:flex w-1/2 h-auto min-h-[600px] relative overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-950">
                        {/* DotMap Background - Full Container */}
                        <div className="absolute inset-0 w-full h-full">
                            <DotMap />
                        </div>

                        {/* Overlay Content - Centered */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 bg-gradient-to-t from-neutral-950/85 via-neutral-950/40 to-neutral-950/60">
                            {/* Logo Icon */}
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="mb-8"
                            >
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-2xl">
                                    <ArrowRight className="text-white h-8 w-8" />
                                </div>
                            </motion.div>

                            {/* Main Title */}
                            <motion.h2
                                initial={{ opacity: 0, y: -15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-5xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"
                            >
                                WorkPulse
                            </motion.h2>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="text-xl font-semibold text-neutral-200 mb-8"
                            >
                                AI
                            </motion.p>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="text-base text-center text-neutral-400 max-w-sm leading-relaxed mb-12"
                            >
                                Smart task assignment & workload management system for high-performing teams
                            </motion.p>
                        </div>
                    </div>
                )}

                {/* Right side - Form */}
                <div className="flex-1 flex items-center justify-center p-12">
                    <div className="w-full max-w-md space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="space-y-3"
                        >
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-50">{title}</h1>
                            <p className="text-neutral-400 text-base">{subtitle}</p>
                        </motion.div>

                        {children}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}