import { useEffect, useState } from 'react'
import { getManagerDashboard } from '@/services/dashboardService'
import type { ManagerDashboard } from '@/services/dashboardService'

export function useManagerDashboard() {
    const [data, setData] = useState<ManagerDashboard | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const fetchData = async () => {
            try {
                if (!isMounted) return
                setLoading(true)
                setError(null)

                console.log('[useManagerDashboard] Fetching manager dashboard...')
                const dashboard = await getManagerDashboard()
                
                if (!isMounted) return
                console.log('[useManagerDashboard] Data received:', dashboard)
                
                setData(dashboard)
                setError(null)
            } catch (err: any) {
                if (!isMounted) return
                
                const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load manager dashboard'
                console.error('[useManagerDashboard] Error:', errorMsg, err)
                setError(errorMsg)
                setData(null)
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchData()

        return () => {
            isMounted = false
        }
    }, [])

    return { data, loading, error }
}