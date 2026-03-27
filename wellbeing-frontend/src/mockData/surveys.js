export const dailySurveyQuestions = [
    {
        id: 1,
        question: 'How are you feeling today?',
        type: 'slider',
        min: 1,
        max: 10,
        labels: ['Very Bad', 'Very Good'],
        field: 'mood',
    },
    {
        id: 2,
        question: 'What\'s your stress level?',
        type: 'slider',
        min: 0,
        max: 100,
        labels: ['No Stress', 'Maximum Stress'],
        field: 'stress',
    },
    {
        id: 3,
        question: 'How is your workload?',
        type: 'slider',
        min: 0,
        max: 100,
        labels: ['Light', 'Heavy'],
        field: 'workload',
    },
    {
        id: 4,
        question: 'How well did you sleep last night?',
        type: 'slider',
        min: 0,
        max: 10,
        labels: ['Poor', 'Excellent'],
        field: 'sleep',
    },
]

export const surveyResponses = [
    {
        date: '2024-03-26',
        mood: 7,
        stress: 65,
        workload: 75,
        sleep: 7,
        completed: true,
    },
    {
        date: '2024-03-25',
        mood: 6,
        stress: 70,
        workload: 80,
        sleep: 6,
        completed: true,
    },
]