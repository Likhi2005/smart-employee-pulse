import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'

export const LoginPage: React.FC = () => {
    const navigate = useNavigate()
    const { login, isAuthenticated, isLoading, error: authError, clearError } = useAuth()
    const [error, setError] = useState<string>('')

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true })
        }
    }, [isAuthenticated, navigate])

    const handleLogin = async (data: { email: string; password: string }) => {
        setError('')
        clearError()

        try {
            const response = await login(data.email, data.password)

            // Check if employee needs to change password
            if (response.user.role === 'employee' && !response.user.isPasswordChanged) {
                navigate('/change-password', { replace: true })
            } else if (response.user.role === 'manager') {
                navigate('/dashboard/manager/overview', { replace: true })
            } else {
                navigate('/dashboard/employee', { replace: true })
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as any)?.response?.data?.message || 'Login failed. Please try again.'
            setError(errorMessage)
        }
    }

    return (
        <AuthLayout title="Welcome back" subtitle="Sign in to your account" showMap={true}>
            <LoginForm
                onSubmit={handleLogin}
                isLoading={isLoading}
                error={error ?? authError ?? ''}
                onErrorDismiss={() => {
                    setError('')
                    clearError()
                }}
            />
        </AuthLayout>
    )
}