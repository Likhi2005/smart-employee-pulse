import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

interface RegisterFormProps {
    onSubmit?: (data: {
        companyName: string
        industry?: string
        managerName: string
        managerEmail: string
        managerPassword: string
    }) => Promise<void>
    isLoading?: boolean
    error?: string
    onErrorDismiss?: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
    onSubmit,
    isLoading = false,
    error: externalError,
    onErrorDismiss,
}) => {
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        managerName: '',
        managerEmail: '',
        managerPassword: '',
        confirmPassword: '',
    })
    const [validationError, setValidationError] = useState('')
    const [isHovered, setIsHovered] = useState(false)

    const error = externalError || validationError

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setValidationError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError('')

        // Validation
        if (!formData.companyName || !formData.managerName || !formData.managerEmail || !formData.managerPassword) {
            setValidationError('Please fill in all required fields')
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.managerEmail)) {
            setValidationError('Please enter a valid email')
            return
        }

        if (formData.managerPassword.length < 6) {
            setValidationError('Password must be at least 6 characters')
            return
        }

        if (formData.managerPassword !== formData.confirmPassword) {
            setValidationError('Passwords do not match')
            return
        }

        try {
            await onSubmit?.({
                companyName: formData.companyName,
                industry: formData.industry,
                managerName: formData.managerName,
                managerEmail: formData.managerEmail,
                managerPassword: formData.managerPassword,
            })
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
            className="space-y-4"
        >
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-md bg-red-50 text-red-800 text-sm border border-red-200 flex items-start justify-between"
                >
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={handleErrorDismiss}
                        className="text-red-600 hover:text-red-700"
                    >
                        ✕
                    </button>
                </motion.div>
            )}

            <Input
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                required
            />

            <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select Industry (Optional)</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Other">Other</option>
            </select>

            <Input
                label="Manager Name"
                name="managerName"
                value={formData.managerName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
            />

            <Input
                label="Manager Email"
                type="email"
                name="managerEmail"
                value={formData.managerEmail}
                onChange={handleChange}
                placeholder="Enter your email"
                required
            />

            <Input
                label="Password"
                type="password"
                name="managerPassword"
                value={formData.managerPassword}
                onChange={handleChange}
                placeholder="Create a strong password"
                helperText="Minimum 6 characters"
                required
            />

            <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
            />

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
                        'w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
                        isHovered ? 'shadow-lg shadow-blue-500/25' : ''
                    )}
                >
                    <span className="flex items-center justify-center">
                        Create Account
                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </span>
                </Button>
            </motion.div>

            <div className="text-center">
                <a
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
                >
                    Already have an account? Sign in
                </a>
            </div>
        </motion.form>
    )
}