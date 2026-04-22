import api from '@/services/api'

export interface LeaderboardEntry {
    id: string
    name: string
    department: string
    score: number
    growth: number
    tasksCompleted: number
    rank: number
}

export const peopleService = {
    getLeaderboard: async (type: 'top' | 'month' | 'all'): Promise<LeaderboardEntry[]> => {
        try {
            const response = await api.get(`/people/leaderboard`, { params: { type } })
            return response.data?.data || []
        } catch (error) {
            // Mock data fallback for development if the endpoint doesn't exist yet
            console.warn('Leaderboard API failed, falling back to mock data', error)
            return generateMockLeaderboard(type)
        }
    }
}

function generateMockLeaderboard(type: string): LeaderboardEntry[] {
    const baseScore = type === 'all' ? 5000 : type === 'month' ? 400 : 900
    return [
        { id: '1', name: 'Alice Smith', department: 'Engineering', score: baseScore + 120, growth: 5.2, tasksCompleted: 45, rank: 1 },
        { id: '2', name: 'Bob Jones', department: 'Design', score: baseScore + 85, growth: 2.1, tasksCompleted: 38, rank: 2 },
        { id: '3', name: 'Charlie Davis', department: 'Marketing', score: baseScore + 40, growth: -1.5, tasksCompleted: 32, rank: 3 },
        { id: '4', name: 'Diana Evans', department: 'Engineering', score: baseScore + 10, growth: 8.4, tasksCompleted: 28, rank: 4 },
        { id: '5', name: 'Evan Frank', department: 'Product', score: baseScore - 15, growth: 0.5, tasksCompleted: 25, rank: 5 },
    ]
}
