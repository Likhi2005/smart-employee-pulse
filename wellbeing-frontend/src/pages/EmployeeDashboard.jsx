import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Smile,
    Zap,
    Heart,
    TrendingUp,
    MessageSquare,
    Gamepad2,
    CheckSquare,
    AlertCircle,
    Calendar,
    Brain,
} from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DailyCheckInModal from '../components/common/DailyCheckInModal'
import { AuthContext } from '../context/AuthContext'
import { weeklyMoodData } from '../mockData/moodData'
import { taskList } from '../mockData/tasks'

export default function EmployeeDashboard() {
    const { user, surveyCompletedToday, completeSurvey } = useContext(AuthContext)
    const navigate = useNavigate()
    const [showSurvey, setShowSurvey] = useState(!surveyCompletedToday)
    const [todayStats, setTodayStats] = useState({
        mood: 7,
        stress: 65,
        happiness: 75,
        workloadCompletion: 78,
    })

    // Auto-open survey if not completed today
    useEffect(() => {
        if (!surveyCompletedToday) {
            setShowSurvey(true)
        }
    }, [surveyCompletedToday])

    const handleSurveyComplete = (responses) => {
        setTodayStats({
            mood: responses.mood || 7,
            stress: responses.stress || 65,
            happiness: 100 - (responses.stress || 65),
            workloadCompletion: 100 - (responses.workload || 25),
        })
        completeSurvey()
        setShowSurvey(false)
    }

    const recentTasks = taskList.slice(0, 3)
    const selectedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    })

    return (
        <div className="min-h-screen dark-bg p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-400">
                        {selectedDate} • Your wellness dashboard
                    </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Mood Score */}
                    <div className="dark-card rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Your Mood</p>
                                <div className="text-4xl font-bold text-white mt-2">
                                    {todayStats.mood}
                                </div>
                                <p className="text-green-400 text-xs font-semibold mt-1">↑ Good</p>
                            </div>
                            <div className="bg-blue-500/20 rounded-full p-4">
                                <Smile size={28} className="text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* Stress Level */}
                    <div className="dark-card rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Stress Level</p>
                                <div className="text-4xl font-bold text-white mt-2">
                                    {todayStats.stress}%
                                </div>
                                <p className="text-yellow-400 text-xs font-semibold mt-1">
                                    ↑ Moderate
                                </p>
                            </div>
                            <div className="bg-purple-500/20 rounded-full p-4">
                                <Zap size={28} className="text-purple-400" />
                            </div>
                        </div>
                    </div>

                    {/* Happiness */}
                    <div className="dark-card rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Happiness</p>
                                <div className="text-4xl font-bold text-white mt-2">
                                    {todayStats.happiness}%
                                </div>
                                <p className="text-green-400 text-xs font-semibold mt-1">
                                    ↑ Very Good
                                </p>
                            </div>
                            <div className="bg-green-500/20 rounded-full p-4">
                                <Heart size={28} className="text-green-400" />
                            </div>
                        </div>
                    </div>

                    {/* Tasks Completion */}
                    <div className="dark-card rounded-2xl p-6 border border-gray-700 hover:border-indigo-500 transition">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Tasks</p>
                                <div className="text-4xl font-bold text-white mt-2">
                                    {todayStats.workloadCompletion}%
                                </div>
                                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden mt-3">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600"
                                        style={{ width: `${todayStats.workloadCompletion}%` }}
                                    />
                                </div>
                            </div>
                            <div className="bg-indigo-500/20 rounded-full p-4">
                                <CheckSquare size={28} className="text-indigo-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => setShowSurvey(true)}
                            className="dark-card rounded-xl p-6 border border-gray-700 hover:border-blue-500 hover:bg-gray-800/50 transition text-center group"
                        >
                            <div className="bg-blue-500/20 rounded-full p-4 mb-3 inline-block group-hover:scale-110 transition">
                                <Calendar size={24} className="text-blue-400" />
                            </div>
                            <p className="font-semibold text-white text-sm">Daily Check-in</p>
                        </button>

                        <button
                            onClick={() => navigate('/chatbot')}
                            className="dark-card rounded-xl p-6 border border-gray-700 hover:border-purple-500 hover:bg-gray-800/50 transition text-center group"
                        >
                            <div className="bg-purple-500/20 rounded-full p-4 mb-3 inline-block group-hover:scale-110 transition">
                                <MessageSquare size={24} className="text-purple-400" />
                            </div>
                            <p className="font-semibold text-white text-sm">Chat Support</p>
                        </button>

                        <button
                            onClick={() => navigate('/games')}
                            className="dark-card rounded-xl p-6 border border-gray-700 hover:border-green-500 hover:bg-gray-800/50 transition text-center group"
                        >
                            <div className="bg-green-500/20 rounded-full p-4 mb-3 inline-block group-hover:scale-110 transition">
                                <Gamepad2 size={24} className="text-green-400" />
                            </div>
                            <p className="font-semibold text-white text-sm">Relax Games</p>
                        </button>

                        <button
                            onClick={() => navigate('/weekly-report')}
                            className="dark-card rounded-xl p-6 border border-gray-700 hover:border-indigo-500 hover:bg-gray-800/50 transition text-center group"
                        >
                            <div className="bg-indigo-500/20 rounded-full p-4 mb-3 inline-block group-hover:scale-110 transition">
                                <TrendingUp size={24} className="text-indigo-400" />
                            </div>
                            <p className="font-semibold text-white text-sm">Weekly Report</p>
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Tasks List */}
                    <div className="lg:col-span-2 dark-card rounded-2xl p-6 border border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Today's Tasks</h3>
                            <button
                                onClick={() => navigate('/tasks')}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                                View All →
                            </button>
                        </div>

                        <div className="space-y-3">
                            {recentTasks.map((task, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition border border-gray-700/50"
                                >
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded bg-gray-700 border-gray-600 cursor-pointer accent-blue-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-white">{task.title}</p>
                                        <p className="text-xs text-gray-400">{task.description}</p>
                                    </div>
                                    <span
                                        className={`text-xs font-semibold px-3 py-1 rounded-full ${task.priority === 'high'
                                                ? 'bg-red-500/20 text-red-400'
                                                : task.priority === 'medium'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-green-500/20 text-green-400'
                                            }`}
                                    >
                                        {task.priority}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Assistant */}
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 border border-purple-500/30">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="bg-blue-400/30 rounded-full p-3">
                                <Brain size={24} className="text-blue-200" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">AI Assistant</h3>
                                <p className="text-blue-100 text-xs">24/7 Support</p>
                            </div>
                        </div>

                        <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                            Feeling stressed? Chat with our AI wellness companion for instant support and
                            personalized relaxation techniques.
                        </p>

                        <Button
                            variant="primary"
                            size="md"
                            className="w-full"
                            onClick={() => navigate('/chatbot')}
                        >
                            Start Chat →
                        </Button>
                    </div>
                </div>

                {/* Weekly Trends */}
                <div className="dark-card rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-6">Weekly Mood Trends</h3>
                    <div className="space-y-4">
                        {weeklyMoodData.map((day, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <span className="w-12 font-medium text-white text-sm">{day.day}</span>
                                <div className="flex-1 space-y-1">
                                    <div className="flex gap-2 text-xs text-gray-400">
                                        <span>Mood</span>
                                        <span>|</span>
                                        <span>Stress</span>
                                    </div>
                                    <div className="flex gap-2 h-2">
                                        <div className="flex-1 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-400 to-blue-600 h-full"
                                                style={{ width: `${(day.mood / 10) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex-1 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-red-400 to-red-600 h-full"
                                                style={{ width: `${day.stress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <span className="w-12 text-right text-sm text-gray-400">{day.mood}/10</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Wellness Tip */}
                <div className="mt-8 dark-card rounded-2xl p-6 border-l-4 border-green-500 border border-gray-700">
                    <div className="flex gap-4">
                        <div className="bg-green-500/20 rounded-full p-3 flex-shrink-0">
                            <AlertCircle size={24} className="text-green-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-green-400 mb-2">💡 Today's Wellness Tip</h4>
                            <p className="text-gray-300 text-sm">
                                Take a 5-minute breathing break every hour. Step away from your desk, breathe
                                deeply, and relax. This simple practice can significantly reduce stress and boost
                                productivity throughout your day.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Survey Modal */}
            <DailyCheckInModal
                isOpen={showSurvey}
                onClose={() => setShowSurvey(false)}
                onComplete={handleSurveyComplete}
            />
        </div>
    )
}