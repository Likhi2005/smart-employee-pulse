import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, TrendingUp, CheckCircle2, Users, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Container } from '../ui/Container'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: 'easeOut' },
    },
}

export const HeroSection = () => {
    const navigate = useNavigate()

    const features = [
        { icon: <TrendingUp className="w-5 h-5" />, text: 'Smart Task Assignment' },
        { icon: <Users className="w-5 h-5" />, text: 'Team Workload Management' },
        { icon: <Zap className="w-5 h-5" />, text: 'AI-Powered Insights' },
    ]

    return (
        <div className="relative min-h-screen bg-neutral-950 overflow-hidden pt-20">
            <Container className="relative z-10 py-20 lg:py-32">
                <motion.div
                    className="max-w-4xl mx-auto space-y-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Badge */}
                    <motion.div variants={itemVariants} className="flex justify-center">
                        <Badge variant="primary" className="gap-2 bg-amber-900/30 text-amber-400 border border-amber-800/50">
                            <Sparkles className="w-4 h-4" />
                            <span>✨ AI-Powered Smart Task Assignment</span>
                        </Badge>
                    </motion.div>

                    {/* Headline */}
                    <motion.div variants={itemVariants} className="text-center space-y-6">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-50 leading-tight">
                            Smart Task Assignment for
                            <span className="block bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
                                Productive Teams
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            Optimize your team's workload with AI-powered task assignment. Balance work intelligently, reduce overload, and boost productivity.
                        </p>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Button
                            onClick={() => navigate('/register')}
                            className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                            size="lg"
                        >
                            Get Started Free
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button
                            onClick={() => navigate('/login')}
                            variant="outline"
                            className="px-8 py-3 rounded-lg text-neutral-50 border-amber-800/50 hover:bg-neutral-900 hover:border-amber-700"
                            size="lg"
                        >
                            Sign In
                        </Button>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        variants={itemVariants}
                        className="grid md:grid-cols-3 gap-6 pt-12"
                    >
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                className="p-6 bg-neutral-900 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-amber-800/30"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-900/20 rounded-lg flex items-center justify-center text-amber-500">
                                        {feature.icon}
                                    </div>
                                    <span className="font-semibold text-neutral-50">{feature.text}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Stats Section */}
                    <motion.div
                        variants={itemVariants}
                        className="grid md:grid-cols-3 gap-8 pt-12 text-center"
                    >
                        <div className="space-y-2">
                            <div className="text-4xl font-bold text-amber-600">500+</div>
                            <p className="text-neutral-400">Teams Using WorkPulse</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold text-amber-600">40%</div>
                            <p className="text-neutral-400">Productivity Increase</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold text-amber-600">99.9%</div>
                            <p className="text-neutral-400">Uptime Guaranteed</p>
                        </div>
                    </motion.div>
                </motion.div>
            </Container>
        </div>
    )
}