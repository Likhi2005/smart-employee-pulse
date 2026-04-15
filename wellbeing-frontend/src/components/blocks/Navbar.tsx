import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { cn } from '../../utils/cn'

export const Navbar = () => {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navItems = [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
    ]

    return (
        <motion.nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm'
                    : 'bg-white/50 backdrop-blur-sm'
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Container className="flex items-center justify-between py-4">
                {/* Logo */}
                <motion.div
                    className="flex items-center gap-2 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate('/')}
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                        <Zap className="text-white" size={24} />
                    </div>
                    <div>
                        <span className="font-bold text-xl text-slate-900">WorkPulse</span>
                        <span className="text-xs text-blue-600 block">AI</span>
                    </div>
                </motion.div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-8">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>

                {/* Desktop CTA Buttons */}
                <div className="hidden lg:flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/login')}
                        className="text-slate-600"
                    >
                        Sign In
                    </Button>
                    <Button
                        onClick={() => navigate('/register')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Get Started
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <div className="lg:hidden flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </Button>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </Container>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="lg:hidden bg-white border-t border-slate-200 shadow-lg"
                >
                    <Container className="py-4 space-y-3">
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="block px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                            </a>
                        ))}
                        <Button
                            onClick={() => {
                                navigate('/register')
                                setIsOpen(false)
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Get Started
                        </Button>
                    </Container>
                </motion.div>
            )}
        </motion.nav>
    )
}