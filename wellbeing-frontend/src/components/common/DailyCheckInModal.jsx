import { useState, useEffect } from 'react'
import { X, CheckCircle } from 'lucide-react'
import Button from './Button'
import { dailySurveyQuestions } from '../../mockData/surveys'

export default function DailyCheckInModal({ isOpen, onClose, onComplete }) {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [responses, setResponses] = useState({})
    const [isCompleting, setIsCompleting] = useState(false)

    const question = dailySurveyQuestions[currentQuestion]
    const progress = ((currentQuestion + 1) / dailySurveyQuestions.length) * 100

    const handleSliderChange = (value) => {
        setResponses({
            ...responses,
            [question.field]: value,
        })
    }

    const handleNext = () => {
        if (currentQuestion < dailySurveyQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
        } else {
            completesurvey()
        }
    }

    const completesurvey = () => {
        setIsCompleting(true)
        setTimeout(() => {
            onComplete(responses)
            setIsCompleting(false)
            onClose()
            setCurrentQuestion(0)
            setResponses({})
        }, 800)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-md w-full p-8 border border-gray-700 shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Daily Check-in</h2>
                        <p className="text-gray-400 text-sm">1 minute survey</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">
                            Question {currentQuestion + 1} of {dailySurveyQuestions.length}
                        </span>
                        <span className="text-gray-400 text-sm">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question */}
                <div className="mb-8 min-h-24">
                    <h3 className="text-xl font-semibold text-white mb-6">
                        {question?.question}
                    </h3>

                    {/* Slider Input */}
                    <div className="space-y-4">
                        <input
                            type="range"
                            min={question?.min}
                            max={question?.max}
                            value={responses[question?.field] || question?.min}
                            onChange={(e) => handleSliderChange(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />

                        {/* Display Value and Labels */}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">{question?.labels[0]}</span>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                    {responses[question?.field] !== undefined
                                        ? responses[question?.field]
                                        : question?.min}
                                </div>
                                <p className="text-xs text-gray-500">selected</p>
                            </div>
                            <span className="text-sm text-gray-400">{question?.labels[1]}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {currentQuestion > 0 && (
                        <Button
                            variant="ghost"
                            size="lg"
                            className="flex-1 !text-gray-300 border border-gray-600"
                            onClick={() => setCurrentQuestion(currentQuestion - 1)}
                        >
                            Back
                        </Button>
                    )}
                    <Button
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        onClick={handleNext}
                        disabled={isCompleting}
                    >
                        {isCompleting ? (
                            'Saving...'
                        ) : currentQuestion === dailySurveyQuestions.length - 1 ? (
                            <>
                                <CheckCircle size={20} />
                                Complete
                            </>
                        ) : (
                            'Next'
                        )}
                    </Button>
                </div>

                {/* Encouragement */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    Your responses help us understand your well-being better 💙
                </p>
            </div>
        </div>
    )
}