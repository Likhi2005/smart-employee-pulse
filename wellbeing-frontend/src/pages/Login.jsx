import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { AuthContext } from '../context/AuthContext'
import { mockUsers } from '../mockData/users'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Simulate API call
        setTimeout(() => {
            const user = mockUsers.find(u => u.email === email && u.password === password)
            if (user) {
                login(user)
                navigate('/dashboard')
            } else {
                setError('Invalid email or password')
            }
            setLoading(false)
        }, 500)
    }

    const quickLogin = (userEmail) => {
        const user = mockUsers.find(u => u.email === userEmail)
        if (user) {
            setEmail(userEmail)
            setPassword('password123')
            setTimeout(() => {
                login(user)
                navigate('/dashboard')
            }, 300)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <div>
                    <div className="text-5xl font-bold mb-2">Pulse</div>
                    <p className="text-blue-100 text-lg">Employee Well-Being System</p>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-3">
                        <CheckCircle size={24} className="text-green-400 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg">Track Your Wellness</h3>
                            <p className="text-blue-100 text-sm">Monitor daily mood and stress levels</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <CheckCircle size={24} className="text-green-400 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg">Relaxation Tools</h3>
                            <p className="text-blue-100 text-sm">Access games and meditation exercises</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <CheckCircle size={24} className="text-green-400 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg">AI Support</h3>
                            <p className="text-blue-100 text-sm">24/7 chatbot for mental health support</p>
                        </div>
                    </div>
                </div>

                <p className="text-blue-100 text-sm">© 2024 Smart Employee Pulse. All rights reserved.</p>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-8 lg:p-12">
                <div className="max-w-md mx-auto w-full">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
                            Pulse
                        </div>
                        <p className="text-gray-600">Employee Well-Being System</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                            <p className="text-gray-600">Sign in to your account</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded animate-in">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email Address"
                            type="email"
                            icon={Mail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            autoFocus
                        />

                        <Input
                            label="Password"
                            type="password"
                            icon={Lock}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                <span className="text-gray-600">Remember me</span>
                            </label>
                            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                                Forgot password?
                            </a>
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full mt-6"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                            <ArrowRight size={20} />
                        </Button>
                    </form>

                    {/* Demo Accounts */}
                    <div className="mt-10 pt-8 border-t border-gray-200">
                        <p className="text-center text-gray-600 text-sm font-medium mb-4">
                            Try Demo Accounts
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => quickLogin('emp@example.com')}
                                className="p-3 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left text-sm"
                            >
                                <div className="font-semibold text-blue-700">👤 Employee</div>
                                <div className="text-gray-600 text-xs">emp@example.com</div>
                            </button>
                            <button
                                onClick={() => quickLogin('manager@example.com')}
                                className="p-3 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left text-sm"
                            >
                                <div className="font-semibold text-purple-700">👥 Manager</div>
                                <div className="text-gray-600 text-xs">manager@example.com</div>
                            </button>
                            <button
                                onClick={() => quickLogin('admin@example.com')}
                                className="p-3 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left text-sm"
                            >
                                <div className="font-semibold text-green-700">⚙️ Admin</div>
                                <div className="text-gray-600 text-xs">admin@example.com</div>
                            </button>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-gray-600 mt-8">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}