import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useAuth } from '@/hooks/useAuth'

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate()
    const { register, isAuthenticated, isLoading, error: authError, clearError } = useAuth()
    const [error, setError] = useState<string>('')

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true })
        }
    }, [isAuthenticated, navigate])

    const handleRegister = async (data: {
        companyName: string
        industry?: string
        managerName: string
        managerEmail: string
        managerPassword: string
    }) => {
        setError('')
        clearError()

        try {
            await register(data)
            navigate('/dashboard/manager/overview', { replace: true })
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as any)?.response?.data?.message || 'Registration failed. Please try again.'
            setError(errorMessage)
        }
    }

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start managing your team's workload smarter"
            showMap={true}
        >
            <RegisterForm
                onSubmit={handleRegister}
                isLoading={isLoading}
                error={error || authError}
                onErrorDismiss={() => {
                    setError('')
                    clearError()
                }}
            />
        </AuthLayout>
    )
}