import React, { useState } from 'react'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

interface LoginFormProps {
    onSubmit?: (data: { email: string; password: string }) => Promise<void>
    isLoading?: boolean
    error?: string
    onErrorDismiss?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
    onSubmit,
    isLoading = false,
    error: externalError,
    onErrorDismiss,
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [validationError, setValidationError] = useState('')
    const [isHovered, setIsHovered] = useState(false)

    const error = externalError || validationError

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError('')

        if (!email || !password) {
            setValidationError('Please fill in all fields')
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setValidationError('Please enter a valid email')
            return
        }

        try {
            await onSubmit?.({ email, password })
        } catch (err) {
            // Error already handled in parent
        }
    }

    const handleErrorDismiss = () => {
        setValidationError('')
        onErrorDismiss?.()
    }

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
        >
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-md bg-red-900/20 text-red-400 text-sm border border-red-800/50 flex items-start justify-between"
                >
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={handleErrorDismiss}
                        className="text-red-400 hover:text-red-300"
                    >
                        ✕
                    </button>
                </motion.div>
            )}

            <Input
                id="email"
                type="email"
                label="Email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value)
                    setValidationError('')
                }}
                placeholder="Enter your email address"
                autoComplete="email"
                required
            />

            <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                    <Input
                        id="password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            setValidationError('')
                        }}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-400"
                    >
                        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="pt-2"
            >
                <Button
                    type="submit"
                    isLoading={isLoading}
                    className={cn(
                        'w-full bg-amber-700 hover:bg-amber-800',
                        isHovered ? 'shadow-lg shadow-amber-500/25' : ''
                    )}
                >
                    <span className="flex items-center justify-center">
                        Sign in
                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </span>
                </Button>
            </motion.div>

            <div className="text-center">
                <a
                    href="/register"
                    className="text-amber-600 hover:text-amber-500 text-sm transition-colors"
                >
                    New company? Register here
                </a>
            </div>
        </motion.form>
    )
}