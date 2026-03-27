export const initialChatMessages = [
    {
        id: 1,
        sender: 'bot',
        message: 'Hi there! 👋 I\'m here to support your well-being. How are you feeling today?',
        timestamp: new Date(Date.now() - 300000),
    },
    {
        id: 2,
        sender: 'bot',
        message: 'Would you like to talk about anything specific, or would you prefer some relaxation tips?',
        timestamp: new Date(Date.now() - 240000),
    },
]

export const chatResponses = {
    stress: 'I understand you\'re feeling stressed. Would you like to try a breathing exercise or talk about what\'s on your mind?',
    anxious: 'Anxiety can be tough. Here are some grounding techniques: 1) Notice 5 things you see, 2) 4 you can touch, 3) 3 you hear, 2) 2 you smell, 1 you taste.',
    tired: 'It sounds like you need some rest. Remember to take breaks throughout the day and stay hydrated.',
    happy: 'That\'s wonderful! Keep up the positive energy! 🎉',
    default: 'Thank you for sharing. I\'m here to listen and support you. What would you like to focus on?',
}