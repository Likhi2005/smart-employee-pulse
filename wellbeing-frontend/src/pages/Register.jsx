import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Building2, ArrowRight, CheckCircle } from 'lucide-react'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { AuthContext } from '../context/AuthContext'
import { useContext } from 'react'

export default function Register() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        password: '',
        confirmPassword: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleStepOne = (e) => {
        e.preventDefault()
        setError('')
        if (!formData.name || !formData.email) {
            setError('Please fill all fields')
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email')
            return
        }
        setStep(2)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        // Simulate registration
        setTimeout(() => {
            const newUser = {
                id: Math.random(),
                ...formData,
                role: 'employee',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
            }
            login(newUser)
            navigate('/dashboard')
            setLoading(false)
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                        Pulse
                    </div>
                    <p className="text-gray-600">Join our wellness community</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${step >= s
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {step > s ? <CheckCircle size={20} /> : s}
                            </div>
                            {s < 2 && (
                                <div
                                    className={`h-1 flex-1 rounded ${step > s ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={step === 1 ? handleStepOne : handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">Basic Information</h2>
                                <p className="text-gray-600 text-sm">Tell us about yourself</p>
                            </div>

                            <Input
                                label="Full Name"
                                type="text"
                                name="name"
                                icon={User}
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                                autoFocus
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                icon={Mail}
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                required
                            />

                            <Input
                                label="Department (Optional)"
                                type="text"
                                name="department"
                                icon={Building2}
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="e.g., Engineering"
                            />

                            <Button variant="primary" size="lg" className="w-full mt-6">
                                Continue
                                <ArrowRight size={20} />
                            </Button>
                        </>
                    )}

                    {/* Step 2: Password */}
                    {step === 2 && (
                        <>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">Set Password</h2>
                                <p className="text-gray-600 text-sm">Create a secure password</p>
                            </div>

                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                icon={Lock}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                autoFocus
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                icon={Lock}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                                ✓ At least 6 characters recommended
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1"
                                    onClick={() => setStep(1)}
                                    type="button"
                                >
                                    Back
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Create Account'}
                                </Button>
                            </div>
                        </>
                    )}
                </form>

                {/* Sign In Link */}
                <p className="text-center text-gray-600 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}