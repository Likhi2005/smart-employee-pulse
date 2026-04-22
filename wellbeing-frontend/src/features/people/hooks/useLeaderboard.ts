import { useState, useEffect, useCallback } from 'react'
import { peopleService, LeaderboardEntry } from '../services/peopleService'

export function useLeaderboard(type: 'top' | 'month' | 'all') {
    const [data, setData] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await peopleService.getLeaderboard(type)
            setData(result)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch leaderboard data')
        } finally {
            setLoading(false)
        }
    }, [type])

    useEffect(() => {
        fetchLeaderboard()
    }, [fetchLeaderboard])

    return { data, loading, error, refetch: fetchLeaderboard }
}
