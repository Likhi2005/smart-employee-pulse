import { useState, useContext } from 'react'
import { Smile, Zap, Briefcase, Moon, Send, CheckCircle } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { AuthContext } from '../context/AuthContext'

export default function MoodCheck() {
    const { user } = useContext(AuthContext)
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        mood: 5,
        stress: 50,
        workload: 50,
        sleep: 6,
        comment: '',
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3000)
        console.log('Submitted:', formData)
    }

    const getMoodEmoji = (value) => {
        if (value <= 2) return '😢'
        if (value <= 4) return '😕'
        if (value <= 6) return '😐'
        if (value <= 8) return '🙂'
        return '😄'
    }

    const getStressColor = (value) => {
        if (value < 30) return 'text-green-600'
        if (value < 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8">
                <h1 className="text-3xl font-bold mb-2">Daily Check-in</h1>
                <p className="text-blue-100">How are you feeling today?</p>
            </div>

            {submitted && (
                <div className="bg-green-50 border-2 border-green-500 text-green-700 px-6 py-4 rounded-lg flex items-center gap-3 animate-in">
                    <CheckCircle size={24} />
                    <div>
                        <p className="font-bold">Thank you!</p>
                        <p className="text-sm">Your well-being data has been saved.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mood */}
                    <Card>
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="font-bold text-gray-800 flex items-center gap-2">
                                        <Smile size={20} className="text-blue-600" />
                                        How's your mood?
                                    </label>
                                    <span className="text-3xl">{getMoodEmoji(formData.mood)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={formData.mood}
                                    onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
                                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-xs text-gray-600 mt-2">
                                    <span>Very Bad</span>
                                    <span className="font-bold text-blue-600 text-lg">{formData.mood}/10</span>
                                    <span>Excellent</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Stress Level */}
                    <Card>
                        <div className="space-y-6">
                            <div>
                                <label className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                                    <Zap size={20} className={getStressColor(formData.stress)} />
                                    Stress Level
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={formData.stress}
                                    onChange={(e) => setFormData({ ...formData, stress: parseInt(e.target.value) })}
                                    className="w-full h-3 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-600">Relaxed</span>
                                    <span className={`font-bold text-lg ${getStressColor(formData.stress)}`}>
                                        {formData.stress}%
                                    </span>
                                    <span className="text-xs text-gray-600">Stressed</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Workload */}
                    <Card>
                        <div className="space-y-6">
                            <div>
                                <label className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                                    <Briefcase size={20} className="text-purple-600" />
                                    Workload Level
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={formData.workload}
                                    onChange={(e) => setFormData({ ...formData, workload: parseInt(e.target.value) })}
                                    className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-600">Light</span>
                                    <span className="font-bold text-lg text-purple-600">{formData.workload}%</span>
                                    <span className="text-xs text-gray-600">Heavy</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Sleep Quality */}
                    <Card>
                        <div className="space-y-6">
                            <div>
                                <label className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                                    <Moon size={20} className="text-indigo-600" />
                                    Sleep Quality (hours)
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="12"
                                    step="0.5"
                                    value={formData.sleep}
                                    onChange={(e) => setFormData({ ...formData, sleep: parseFloat(e.target.value) })}
                                    className="w-full h-3 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-600">Poor</span>
                                    <span className="font-bold text-lg text-indigo-600">{formData.sleep}h</span>
                                    <span className="text-xs text-gray-600">Excellent</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Comments */}
                <Card>
                    <label className="font-bold text-gray-800 mb-4 block">Additional Comments (Optional)</label>
                    <textarea
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        placeholder="Share anything on your mind... How was your day? Any specific concerns?"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none h-24"
                    />
                </Card>

                {/* Submit */}
                <div className="flex gap-4">
                    <Button variant="outline" size="lg" className="flex-1" type="reset">
                        Clear
                    </Button>
                    <Button variant="primary" size="lg" className="flex-1">
                        <Send size={20} />
                        Submit Check-in
                    </Button>
                </div>
            </form>

            {/* Tips Section */}
            <Card className="bg-blue-50 border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-900 mb-3">💡 Tip for Better Results</h3>
                <p className="text-blue-800 text-sm">
                    Be honest with your responses. Your data helps us understand your wellness patterns and
                    provide better support. Your responses are private and secure.
                </p>
            </Card>
        </div>
    )
}